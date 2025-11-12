import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  LogIn,
  UserPlus,
  Calendar,
  Search,
  User,
  CheckCircle,
  AlertCircle,
  Home,
  X,
  Star,
  Info,
  Users,
  Plus,
  Trash2,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ReactFlagsSelect from "react-flags-select";
import { toast } from "sonner";
import { useWalkIn } from "../hooks/useWalkIn";
import { useGuests } from "../../guests/hooks/useGuests";
import { useRoomSelection } from "../hooks/useRoomSelection";
import { useInputValidation } from "../../../hooks/useInputValidation";
import { useFolioFlow } from "../hooks/useFolioFlow";
import { useReservationByCode } from "../../reservations/hooks/useReservationQueries";
import { folioService } from "../services/folioService";
import { ROUTES } from "../../../router/routes";
import { DEFAULT_CURRENCY } from "../constants/currencies";
import type { PaymentMethod, Currency } from "../types/checkin";
import type { Guest } from "../../../types/core/domain";
import type { RoomInfo } from "../types/room";
import { CurrencySelector } from "./CurrencySelector";
import { Alert } from "../../../components/ui";

type CheckInType = "reservation" | "walk-in";
type WalkInGuestType = "new" | "existing";

// Acompañante local
type Acompanante = {
  id: string; // ID temporal para React keys
  nombre: string;
  documento: string;
  email?: string;
  id_cliente?: number; // Si es un cliente existente
  isExisting?: boolean; // Flag para saber si viene de búsqueda
};

type LocalState = {
  reservationId: string;
  firstName: string;
  lastName: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  adultos: number;
  ninos: number;
  bebes: number;
  identificationNumber: string;
  paymentStatus: "pending" | "completed";
  paymentMethod: PaymentMethod | "";
  currency: Currency;
  email: string;
  phone: string;
  phoneCountryCode: string;
  nationality: string;
  selectedGuestId: string;
  guestSearchTerm: string;
  // 👥 Acompañantes
  pago_modo: string; // "por_persona" | "por_habitacion"
  acompanantes: Acompanante[];
};

// Helper functions to reduce complexity
const getInputClasses = (hasError: boolean, isReadOnly?: boolean) => {
  const baseClasses =
    "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2";
  const errorClasses = hasError
    ? "border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:ring-blue-500";
  const readOnlyClasses = isReadOnly ? "bg-gray-50" : "";
  return `${baseClasses} ${errorClasses} ${readOnlyClasses}`;
};

const getButtonClasses = (
  isActive: boolean,
  variant: "blue" | "green" | "purple" = "blue"
) => {
  const colorMap = {
    blue: isActive
      ? "bg-white text-blue-600 shadow-sm"
      : "text-gray-600 hover:text-gray-900",
    green: isActive
      ? "bg-white text-green-600 shadow-sm"
      : "text-gray-600 hover:text-gray-900",
    purple: isActive
      ? "bg-white text-purple-600 shadow-sm"
      : "text-gray-600 hover:text-gray-900",
  };
  return `px-6 py-2 rounded-md text-sm font-medium transition-colors ${colorMap[variant]}`;
};

const isFieldReadOnly = (
  checkInType: CheckInType,
  walkInGuestType: WalkInGuestType,
  selectedGuestId: string
) => {
  return (
    checkInType === "walk-in" &&
    walkInGuestType === "existing" &&
    selectedGuestId !== ""
  );
};

// Helper function to get room status display
const getRoomStatusDisplay = (status: string) => {
  const getStatusColor = () => {
    if (status === "available") return "text-green-600";
    if (status === "occupied") return "text-red-600";
    return "text-yellow-600";
  };

  const getStatusText = () => {
    if (status === "available") return "Disponible";
    if (status === "occupied") return "Ocupada";
    return "Mantenimiento";
  };

  return {
    color: getStatusColor(),
    text: getStatusText(),
  };
};

// Helper function to render room information content
const renderRoomInfoContent = (
  loadingRoomInfo: boolean,
  roomInfo: RoomInfo | null
) => {
  if (loadingRoomInfo) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 italic">
          Cargando información de la habitación...
        </div>
      </div>
    );
  }

  if (roomInfo) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">Tipo:</span> {roomInfo.type}
          </div>
          <div>
            <span className="font-medium">Capacidad:</span>{" "}
            {roomInfo.capacity.adults} adultos, {roomInfo.capacity.children}{" "}
            niños
          </div>
          <div>
            <span className="font-medium">Estado:</span>
            <span
              className={`ml-1 ${getRoomStatusDisplay(roomInfo.status).color}`}
            >
              {getRoomStatusDisplay(roomInfo.status).text}
            </span>
          </div>
          <div>
            <span className="font-medium">Piso:</span> {roomInfo.floor}
          </div>
          <div>
            <span className="font-medium">Precio:</span> ${roomInfo.price.base}/
            {roomInfo.price.currency}
          </div>
          <div>
            <span className="font-medium">Vista:</span>{" "}
            {roomInfo.features.hasSeaView ? "Mar" : "Ciudad"}
          </div>
        </div>

        {/* Amenidades */}
        <div className="mt-2">
          <span className="font-medium text-xs text-gray-600">Amenidades:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {roomInfo.amenities.map((amenity: string) => (
              <span
                key={amenity}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="text-xs text-gray-500 italic">
        Habitación no encontrada en el sistema
      </div>
    </div>
  );
};

const CheckIn = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Hook original de check-in (comentado temporalmente - ahora usamos folios)
  // const {
  //   validateAndSubmit,
  //   isSubmitting,
  //   error,
  //   clearError: clearCheckInError,
  // } = useCheckInImproved();

  const {
    performWalkInWithNewGuest,
    performWalkInWithExistingGuest,
    isSubmitting: isSubmittingWalkIn,
    error: walkInError,
    clearError: clearWalkInError,
  } = useWalkIn();

  // Hook de folios para integración completa
  const {
    isLoading: isCreatingFolio,
    error: folioError,
    realizarCheckIn: realizarCheckInConFolio,
    limpiarError: limpiarErrorFolio,
  } = useFolioFlow();

  const { guests, searchGuests } = useGuests();
  const {
    suggestions: roomSuggestions,
    searchRoomSuggestions,
    getRoomInfo,
    selectRoom,
  } = useRoomSelection();

  const { errors, validate, getCommonRules, clearError } = useInputValidation();

  const [checkInType, setCheckInType] = useState<CheckInType>("reservation");
  const [walkInGuestType, setWalkInGuestType] =
    useState<WalkInGuestType>("new");

  // Opciones de métodos de pago
  const paymentMethods = [
    { value: "credit_card", label: "Tarjeta de crédito" },
    { value: "debit_card", label: "Tarjeta de débito" },
    { value: "cash", label: "Efectivo" },
    {
      value: "bank_transfer",
      label: "Transferencia bancaria / depósito previo",
    },
    { value: "agency_voucher", label: "Voucher de agencia" },
    { value: "courtesy", label: "Cortesía / No pagar (comp)" },
    { value: "corporate_account", label: "Cargo a cuenta corporativa" },
    { value: "points_miles", label: "Puntos o millas" },
  ] as const;

  // Estado inicial del formulario
  const [formData, setFormData] = useState<LocalState>({
    reservationId: "",
    firstName: "",
    lastName: "",
    roomNumber: "",
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    numberOfGuests: 1,
    adultos: 1,
    ninos: 0,
    bebes: 0,
    identificationNumber: "",
    paymentStatus: "pending",
    paymentMethod: "",
    currency: DEFAULT_CURRENCY,
    email: "",
    phone: "",
    phoneCountryCode: "us",
    nationality: "US",
    selectedGuestId: "",
    guestSearchTerm: "",
    // 👥 Acompañantes
    pago_modo: "por_persona", // ✅ valor permitido por backend
    acompanantes: [],
  });

  // Estado para edición del campo de habitación
  const [isRoomEditable, setIsRoomEditable] = useState(false);

  // Estado para información de habitación
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [loadingRoomInfo, setLoadingRoomInfo] = useState(false);

  // Estados para búsqueda de acompañantes
  const [showGuestSearchModal, setShowGuestSearchModal] = useState(false);
  const [currentAcompananteId, setCurrentAcompananteId] = useState<
    string | null
  >(null);
  const [guestSearchQuery, setGuestSearchQuery] = useState("");

  // Estados para búsqueda de reserva
  const [reservationSearchId, setReservationSearchId] = useState("");

  // Hook para obtener datos de reserva por CÓDIGO DE RESERVA
  const {
    data: foundReservation,
    isLoading: isLoadingReservation,
    isError: isReservationError,
    error: reservationError,
  } = useReservationByCode(reservationSearchId, !!reservationSearchId);

  // Estado para controlar si se han cargado datos de reserva
  const [hasLoadedReservationData, setHasLoadedReservationData] =
    useState(false);

  // Efecto para cargar información de habitación cuando cambia el número
  useEffect(() => {
    const fetchRoomInfo = async () => {
      if (formData.roomNumber) {
        setLoadingRoomInfo(true);
        try {
          const info = await getRoomInfo(formData.roomNumber);
          setRoomInfo(info);
        } catch (error) {
          console.error("Error fetching room info:", error);
          setRoomInfo(null);
        } finally {
          setLoadingRoomInfo(false);
        }
      } else {
        setRoomInfo(null);
      }
    };
    fetchRoomInfo();
  }, [formData.roomNumber, getRoomInfo]);

  // Efecto para autorellenar datos cuando se encuentra una reserva
  useEffect(() => {
    if (
      foundReservation &&
      !hasLoadedReservationData &&
      checkInType === "reservation"
    ) {
      // Autorellenar datos del huésped
      if (foundReservation.guest) {
        const guest = foundReservation.guest;
        const fullLastName = guest.secondLastName
          ? `${guest.firstLastName} ${guest.secondLastName}`
          : guest.firstLastName;

        setFormData((prev) => ({
          ...prev,
          firstName: guest.firstName,
          lastName: fullLastName,
          email: guest.email,
          phone: guest.phone,
          identificationNumber: guest.documentNumber,
          nationality: guest.nationality || "US",
        }));
      }

      // Autorellenar datos de la estancia
      const roomNumber =
        foundReservation.room?.number ||
        foundReservation.roomType?.match(/\d+/)?.[0] ||
        "";

      // Verificar si faltan datos críticos
      const missingData: string[] = [];
      if (!roomNumber) missingData.push("Habitación");
      if (!foundReservation.checkInDate) missingData.push("Fecha de llegada");
      if (!foundReservation.checkOutDate) missingData.push("Fecha de salida");
      if (!foundReservation.numberOfAdults || foundReservation.numberOfAdults === 0) missingData.push("Número de adultos");

      if (missingData.length > 0) {
        toast.warning("Datos incompletos en la reserva", {
          description: `Faltan los siguientes datos: ${missingData.join(", ")}. Por favor, complételos manualmente.`,
          duration: 8000,
        });
      }

      setFormData((prev) => ({
        ...prev,
        checkInDate: foundReservation.checkInDate
          ? foundReservation.checkInDate.split("T")[0]
          : prev.checkInDate,
        checkOutDate: foundReservation.checkOutDate
          ? foundReservation.checkOutDate.split("T")[0]
          : prev.checkOutDate,
        numberOfGuests: foundReservation.numberOfGuests || 0,
        adultos: foundReservation.numberOfAdults || 0,
        ninos: foundReservation.numberOfChildren || 0,
        bebes: foundReservation.numberOfInfants || 0,
        roomNumber: roomNumber,
      }));

      setHasLoadedReservationData(true);
    }
  }, [foundReservation, hasLoadedReservationData, checkInType]);

  // Resetear datos cargados cuando cambia el tipo de check-in
  useEffect(() => {
    if (checkInType === "walk-in") {
      setHasLoadedReservationData(false);
      setReservationSearchId("");
    }
  }, [checkInType]);

  // Función para cambiar el tipo de check-in y limpiar datos relevantes
  const handleCheckInTypeChange = (type: CheckInType) => {
    setCheckInType(type);
    setHasLoadedReservationData(false);
    if (type === "walk-in") {
      // Limpiar el ID de reserva para walk-ins
      setFormData((prev) => ({ ...prev, reservationId: "" }));
      setReservationSearchId("");
    } else {
      // Limpiar datos de walk-in
      setFormData((prev) => ({
        ...prev,
        selectedGuestId: "",
        guestSearchTerm: "",
      }));
    }
  };

  // Función para buscar reserva por ID
  const handleSearchReservation = () => {
    if (formData.reservationId.trim()) {
      setReservationSearchId(formData.reservationId.trim());
      setHasLoadedReservationData(false);
    }
  };

  // Función para limpiar búsqueda de reserva
  const handleClearReservation = () => {
    setFormData((prev) => ({
      ...prev,
      reservationId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      identificationNumber: "",
      nationality: "US",
      checkInDate: new Date().toISOString().split("T")[0],
      checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      numberOfGuests: 1,
      adultos: 1,
      ninos: 0,
      bebes: 0,
      roomNumber: "",
    }));
    setReservationSearchId("");
    setHasLoadedReservationData(false);
  };

  // Función para cambiar el tipo de huésped en walk-in
  const handleWalkInGuestTypeChange = (type: WalkInGuestType) => {
    setWalkInGuestType(type);
    if (type === "new") {
      // Limpiar datos del huésped seleccionado
      setFormData((prev) => ({
        ...prev,
        selectedGuestId: "",
        guestSearchTerm: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        identificationNumber: "",
        nationality: "US",
      }));
    }
  };

  // Función para buscar huéspedes
  const handleGuestSearch = (searchTerm: string) => {
    setFormData((prev) => ({ ...prev, guestSearchTerm: searchTerm }));
    if (searchTerm.length >= 2) {
      searchGuests({
        query: searchTerm,
        isActive: true,
        limit: 10,
      });
    }
  };

  // Función para seleccionar un huésped existente
  const handleSelectExistingGuest = (guest: Guest) => {
    const fullLastName = guest.secondLastName
      ? `${guest.firstLastName} ${guest.secondLastName}`
      : guest.firstLastName;

    setFormData((prev) => ({
      ...prev,
      selectedGuestId: guest.id,
      firstName: guest.firstName,
      lastName: fullLastName,
      email: guest.email,
      phone: guest.phone,
      identificationNumber: guest.documentNumber,
      nationality: guest.nationality || "US",
      guestSearchTerm: `${guest.firstName} ${fullLastName}`,
    }));
  };

  // Función para vincular un huésped existente como acompañante
  const handleSelectGuestAsAcompanante = (guest: Guest) => {
    if (!currentAcompananteId) return;

    const fullLastName = guest.secondLastName
      ? `${guest.firstLastName} ${guest.secondLastName}`
      : guest.firstLastName;

    const updatedAcompanantes = formData.acompanantes.map((a) => {
      if (a.id === currentAcompananteId) {
        return {
          ...a,
          nombre: `${guest.firstName} ${fullLastName}`,
          documento: guest.documentNumber,
          email: guest.email,
          id_cliente: Number.parseInt(guest.id),
          isExisting: true,
        };
      }
      return a;
    });

    setFormData((prev) => ({
      ...prev,
      acompanantes: updatedAcompanantes,
    }));

    // Cerrar modal y limpiar búsqueda
    setShowGuestSearchModal(false);
    setCurrentAcompananteId(null);
    setGuestSearchQuery("");

    toast.success("Cliente vinculado", {
      description: `${guest.firstName} ${fullLastName} ha sido vinculado como acompañante`,
    });
  };

  // Filtrar huéspedes para búsqueda de acompañantes
  const filteredGuestsForAcompanante = guests.filter((guest) => {
    if (!guestSearchQuery || guestSearchQuery.length < 2) return false;
    const searchTerm = guestSearchQuery.toLowerCase();
    const fullName = `${guest.firstName} ${guest.firstLastName} ${
      guest.secondLastName || ""
    }`.toLowerCase();
    return (
      fullName.includes(searchTerm) ||
      guest.email.toLowerCase().includes(searchTerm) ||
      guest.documentNumber.toLowerCase().includes(searchTerm)
    );
  });

  // Filtrar huéspedes para mostrar en la búsqueda
  const filteredGuests = guests.filter((guest) => {
    if (!formData.guestSearchTerm || formData.guestSearchTerm.length < 2)
      return false;
    const searchTerm = formData.guestSearchTerm.toLowerCase();
    const fullName = `${guest.firstName} ${guest.firstLastName} ${
      guest.secondLastName || ""
    }`.toLowerCase();
    return (
      fullName.includes(searchTerm) ||
      guest.email.toLowerCase().includes(searchTerm) ||
      guest.documentNumber.toLowerCase().includes(searchTerm)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ✅ Validar acompañantes antes de continuar
      if (formData.acompanantes.length > 0) {
        const invalidAcompanantes = formData.acompanantes.filter(
          (acomp) => !acomp.nombre.trim() || !acomp.documento.trim()
        );

        if (invalidAcompanantes.length > 0) {
          toast.error("Datos de acompañantes incompletos", {
            description:
              "Todos los acompañantes deben tener nombre y documento",
            duration: 5000,
          });
          return;
        }

        // Validar email si fue proporcionado
        const invalidEmails = formData.acompanantes.filter(
          (acomp) =>
            acomp.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(acomp.email)
        );

        if (invalidEmails.length > 0) {
          toast.error("Emails inválidos", {
            description:
              "Algunos acompañantes tienen emails con formato inválido",
            duration: 5000,
          });
          return;
        }
      }

      // **WALK-IN: Lógica completamente diferente**
      if (checkInType === "walk-in") {
        // Validar campos requeridos para Walk-In
        if (!formData.roomNumber) {
          throw new Error("El número de habitación es requerido");
        }
        if (!formData.checkInDate || !formData.checkOutDate) {
          throw new Error("Las fechas de check-in y check-out son requeridas");
        }
        if (formData.adultos < 1) {
          throw new Error("Debe haber al menos 1 adulto");
        }

        const stayData = {
          roomNumber: formData.roomNumber,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          adultos: formData.adultos,
          ninos: formData.ninos,
          bebes: formData.bebes,
          paymentMethod: formData.paymentMethod || undefined,
        };

        let result;

        if (walkInGuestType === "new") {
          // Validar datos del huésped nuevo
          if (!formData.firstName || !formData.lastName) {
            throw new Error("El nombre y apellido del huésped son requeridos");
          }
          if (!formData.email) {
            throw new Error("El email es requerido para Walk-In");
          }
          if (!formData.phone) {
            throw new Error("El teléfono es requerido para Walk-In");
          }
          if (!formData.identificationNumber) {
            throw new Error("El número de identificación es requerido");
          }

          const guestData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            nationality: formData.nationality,
            identificationNumber: formData.identificationNumber,
          };

          result = await performWalkInWithNewGuest(guestData, stayData);
        } else {
          // walkInGuestType === "existing"
          if (!formData.selectedGuestId) {
            throw new Error("Debe seleccionar un huésped existente");
          }

          const guestId = Number.parseInt(formData.selectedGuestId, 10);
          if (Number.isNaN(guestId)) {
            throw new TypeError("ID de huésped inválido");
          }

          result = await performWalkInWithExistingGuest(guestId, stayData);
        }

        if (result.success) {
          navigate(ROUTES.FRONTDESK.BASE);
        }

        return;
      }

      // **RESERVA EXISTENTE: Lógica original**
      // 1. Validar que tenemos ID de reserva
      if (checkInType === "reservation" && !formData.reservationId) {
        throw new Error(
          "El ID de reserva es requerido para reservas existentes"
        );
      }

      // 2. Validar estado de la reserva (debe ser 'pending' o 'confirmed')
      if (checkInType === "reservation" && foundReservation) {
        const validStatuses = ["pending", "confirmed"];

        if (!validStatuses.includes(foundReservation.status)) {
          const statusMessages: Record<string, string> = {
            cancelled: "La reserva está cancelada",
            checked_in: "Esta reserva ya tiene check-in realizado",
            checked_out: "Esta reserva ya tiene check-out realizado",
            no_show: "Esta reserva está marcada como No Show",
            completed: "Esta reserva ya está finalizada",
            waiting: "Esta reserva está en espera",
          };

          const message =
            statusMessages[foundReservation.status] ||
            `No se puede realizar check-in porque la reserva está en estado: ${foundReservation.status}`;

          // Mostrar toast de error en lugar de throw
          toast.error("Estado de Reserva Inválido", {
            description: `${message}. Solo se permite check-in para reservas Pendientes o Confirmadas.`,
            duration: 5000,
          });

          // Retornar sin continuar
          return;
        }
      }

      // Limpiar el ID de reserva (remover espacios)
      const reservaId = formData.reservationId.trim();
      if (!reservaId) {
        throw new Error("El ID de reserva no puede estar vacío");
      }

      // ============================================================================
      // 🆕 INTEGRACIÓN CON MÓDULO DE FOLIOS
      // ============================================================================

      // 🔍 Obtener el ID real de la habitación
      // Opción 1: Si tenemos la reserva cargada, usar su roomId
      let habitacionId: number;

      if (foundReservation?.roomId) {
        habitacionId =
          typeof foundReservation.roomId === "string"
            ? Number.parseInt(foundReservation.roomId, 10)
            : foundReservation.roomId;
      } else {
        habitacionId = Number.parseInt(formData.roomNumber, 10);
      }

      const checkInDataConFolio = {
        id_cliente_titular: Number.parseInt(formData.selectedGuestId || "1"),
        fecha_llegada: formData.checkInDate,
        fecha_salida: formData.checkOutDate,
        adultos: formData.adultos,
        ninos: formData.ninos,
        id_hab: habitacionId, // ← Usar el ID real de la habitación
        nombre_asignacion:
          `${formData.firstName} ${formData.lastName}`.substring(0, 50), // ← Limitar a 50 caracteres
        pago_modo: formData.pago_modo || "por_persona",
        acompanantes: formData.acompanantes.map((acomp) => ({
          nombre: acomp.nombre,
          documento: acomp.documento,
          email: acomp.email,
          ...(acomp.id_cliente && { id_cliente: acomp.id_cliente }),
        })),
      };

      // Realizar check-in con creación de folio
      const nuevoFolioId = await realizarCheckInConFolio(
        reservaId,
        checkInDataConFolio
      );

      if (!nuevoFolioId) {
        throw new Error(
          "No se pudo crear el folio. La reserva podría no existir o los datos podrían ser incorrectos. Verifica el código de reserva."
        );
      }

      // ============================================================================
      // 🔧 WORKAROUND: Agregar cargo inicial usando distribución
      // ============================================================================
      
      try {
        // Calcular cargo de alojamiento
        const checkInDateObj = new Date(formData.checkInDate);
        const checkOutDateObj = new Date(formData.checkOutDate);
        const timeDiff = checkOutDateObj.getTime() - checkInDateObj.getTime();
        const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // Obtener precio base de la habitación (con fallback a precio estándar)
        const baseRoomPrice = roomInfo?.price?.base || 75;
        const totalRoomCost = numberOfNights * baseRoomPrice;
        
        if (totalRoomCost > 0) {
          // Agregar cargo inicial usando distribución
          const cargoData = {
            descripcion: `Alojamiento habitación #${formData.roomNumber} (${numberOfNights} ${numberOfNights === 1 ? 'noche' : 'noches'})`,
            monto: totalRoomCost,
            id_cliente_titular: Number.parseInt(formData.selectedGuestId || "1", 10)
          };
          
          await folioService.agregarCargoInicial(nuevoFolioId, cargoData);
          
          // Mostrar mensaje de éxito con información del cargo
          toast.success("Check-in completado exitosamente", {
            description: `Folio #${nuevoFolioId} creado con cargo de $${totalRoomCost} por ${numberOfNights} ${numberOfNights === 1 ? 'noche' : 'noches'}.`,
            duration: 5000,
          });
        } else {
          // Mostrar mensaje básico sin cargo
          toast.success("Check-in completado exitosamente", {
            description: `Folio #${nuevoFolioId} creado. No se agregaron cargos automáticos.`,
            duration: 5000,
          });
        }
        
      } catch {
        // Mostrar advertencia pero no fallar el check-in
        toast.warning("Advertencia", {
          description: `Check-in completado, pero no se pudo agregar el cargo de alojamiento automáticamente. Folio #${nuevoFolioId} creado.`,
          duration: 6000,
        });
      }

      // Guardar folioId para usar en check-out
      localStorage.setItem(`folio_${reservaId}`, nuevoFolioId.toString());

      // Guardar información adicional del check-in
      const checkInInfo = {
        folioId: nuevoFolioId,
        reservationId: reservaId,
        roomNumber: formData.roomNumber,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guestName: `${formData.firstName} ${formData.lastName}`,
        pago_modo: formData.pago_modo,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(
        `checkin_info_${reservaId}`,
        JSON.stringify(checkInInfo)
      );

      // Invalidar queries relacionadas
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["checkIns"] }),
        queryClient.invalidateQueries({ queryKey: ["rooms"] }),
        queryClient.invalidateQueries({ queryKey: ["reservations"] }),
        queryClient.invalidateQueries({ queryKey: ["estadias"] }),
        queryClient.invalidateQueries({ queryKey: ["folios"] }),
      ]);

      navigate(ROUTES.FRONTDESK.BASE);
    } catch (validationError) {
      if (validationError instanceof Error) {
        alert(
          `ERROR al procesar ${
            checkInType === "walk-in" ? "Walk-In" : "Check-In"
          }:\n\n${
            validationError.message
          }\n\nRevisa la consola para más detalles.`
        );
      }
    }
  };

  // Helper functions to extract nested ternary operations
  const getSubmitButtonStyles = (): string => {
    return checkInType === "walk-in"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-blue-600 hover:bg-blue-700";
  };

  const getSubmitButtonText = (): string => {
    const submitting = isSubmittingWalkIn || isCreatingFolio;

    if (submitting) {
      return isCreatingFolio ? "Creando folio..." : "Procesando...";
    }

    return checkInType === "walk-in"
      ? "Registrar Walk-In"
      : "Realizar Check-In";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header with centered title and back button */}
          <div className="relative flex items-center justify-center mb-8">
            {/* Centered title */}
            <div className="flex items-center gap-3">
              <LogIn className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Check-In</h1>
            </div>

            {/* Back button positioned in top right */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.FRONTDESK.BASE)}
              className="absolute left-0 flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Regresar al Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Regresar</span>
            </button>
          </div>

          {/* Selector de tipo de Check-In */}
          <div className="mb-6">
            <div className="flex justify-center">
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  type="button"
                  onClick={() => handleCheckInTypeChange("reservation")}
                  className={getButtonClasses(checkInType === "reservation")}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Reserva Existente
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckInTypeChange("walk-in")}
                  className={getButtonClasses(
                    checkInType === "walk-in",
                    "green"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Walk-In
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Sistema de alertas mejorado */}
          {(walkInError || folioError) && (
            <div className="mb-6">
              <Alert
                type="error"
                title={
                  checkInType === "walk-in"
                    ? "Error en Walk-In"
                    : "Error al crear Folio"
                }
                message={
                  checkInType === "walk-in"
                    ? walkInError || ""
                    : folioError || ""
                }
                onClose={() => {
                  // Limpiar error apropiado
                  if (folioError && limpiarErrorFolio) {
                    limpiarErrorFolio();
                  } else if (
                    checkInType === "walk-in" &&
                    typeof clearWalkInError === "function"
                  ) {
                    clearWalkInError();
                  }
                }}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de ID de Reserva - Solo para reservas existentes */}
            {checkInType === "reservation" && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Información de la Reserva
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="reservationId"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Código de Reserva <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="reservationId"
                        type="text"
                        value={formData.reservationId}
                        onChange={(e) => {
                          // Permitir letras, números, guiones
                          const value = e.target.value.toUpperCase();
                          if (/^[A-Z0-9-]*$/.test(value)) {
                            setFormData((prev) => ({
                              ...prev,
                              reservationId: value,
                            }));
                            if (hasLoadedReservationData) {
                              setHasLoadedReservationData(false);
                            }
                          }
                        }}
                        className={getInputClasses(false, false)}
                        required={checkInType === "reservation"}
                        placeholder="Ej: JTFLGLKR o JTFL-GLKR"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchReservation();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSearchReservation}
                        disabled={
                          !formData.reservationId.trim() || isLoadingReservation
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoadingReservation ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            Buscar
                          </>
                        )}
                      </button>
                      {hasLoadedReservationData && (
                        <button
                          type="button"
                          onClick={handleClearReservation}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Ingrese el código de 8 caracteres (con o sin guión).
                      Ejemplo: JTFLGLKR
                    </p>
                  </div>

                  {/* Estado de búsqueda de reserva */}
                  {isLoadingReservation && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Buscando reserva...
                    </div>
                  )}

                  {isReservationError && reservationError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      No se encontró la reserva o ocurrió un error:{" "}
                      {reservationError.message}
                    </div>
                  )}

                  {foundReservation && hasLoadedReservationData && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Reserva encontrada - Datos cargados automáticamente
                      <div className="ml-auto">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Estado: {foundReservation.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Información adicional de la reserva encontrada */}
                  {foundReservation && hasLoadedReservationData && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Detalles de la Reserva
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <strong>Confirmación:</strong>{" "}
                          {foundReservation.confirmationNumber}
                        </div>
                        <div>
                          <strong>Estado:</strong> {foundReservation.status}
                        </div>
                        <div>
                          <strong>Huéspedes:</strong>{" "}
                          {foundReservation.numberOfGuests} personas
                        </div>
                        <div>
                          <strong>Noches:</strong>{" "}
                          {foundReservation.numberOfNights}
                        </div>
                        <div>
                          <strong>Total:</strong> ${foundReservation.total}
                        </div>
                        {foundReservation.specialRequests && (
                          <div className="col-span-2">
                            <strong>Solicitudes:</strong>{" "}
                            {foundReservation.specialRequests}
                          </div>
                        )}
                      </div>

                      {/* Instrucciones para el check-in */}
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center gap-2 text-blue-800 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">
                            Listo para Check-In
                          </span>
                        </div>
                        <p className="text-blue-700 text-xs mt-1">
                          Los datos se han cargado automáticamente. Verifique la
                          información y complete el check-in.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información del Huésped */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información del Huésped
                {checkInType === "walk-in" && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Walk-In
                  </span>
                )}
              </h2>

              {/* Selector de tipo de huésped para Walk-In */}
              {checkInType === "walk-in" && (
                <div className="mb-6">
                  <div className="flex justify-center">
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                      <button
                        type="button"
                        onClick={() => handleWalkInGuestTypeChange("new")}
                        className={getButtonClasses(
                          walkInGuestType === "new",
                          "green"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Huésped Nuevo
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWalkInGuestTypeChange("existing")}
                        className={getButtonClasses(
                          walkInGuestType === "existing",
                          "green"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          Huésped Existente
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Búsqueda de huésped existente para Walk-In */}
              {isFieldReadOnly(checkInType, walkInGuestType, "") && (
                <div className="mb-6">
                  <label
                    htmlFor="guestSearch"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Buscar Huésped <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="guestSearch"
                      type="text"
                      value={formData.guestSearchTerm}
                      onChange={(e) => handleGuestSearch(e.target.value)}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Buscar por nombre, email o documento..."
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>

                  {/* Lista de huéspedes encontrados */}
                  {formData.guestSearchTerm.length >= 2 &&
                    filteredGuests.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm">
                        {filteredGuests.slice(0, 5).map((guest) => (
                          <button
                            key={guest.id}
                            type="button"
                            onClick={() => handleSelectExistingGuest(guest)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {guest.firstName} {guest.firstLastName}{" "}
                                  {guest.secondLastName || ""}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {guest.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Doc: {guest.documentNumber}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                  {formData.guestSearchTerm.length >= 2 &&
                    filteredGuests.length === 0 && (
                      <p className="mt-2 text-sm text-gray-500">
                        No se encontraron huéspedes. Intenta con un término
                        diferente.
                      </p>
                    )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    maxLength={15}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir letras y espacios
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) {
                        setFormData((prev) => ({ ...prev, firstName: value }));
                        clearError("firstName");
                      }
                    }}
                    onBlur={(e) =>
                      validate(
                        "firstName",
                        e.target.value,
                        getCommonRules("firstName")
                      )
                    }
                    className={getInputClasses(
                      !!errors.firstName,
                      isFieldReadOnly(
                        checkInType,
                        walkInGuestType,
                        formData.selectedGuestId
                      ) || hasLoadedReservationData
                    )}
                    required
                    readOnly={
                      isFieldReadOnly(
                        checkInType,
                        walkInGuestType,
                        formData.selectedGuestId
                      ) || hasLoadedReservationData
                    }
                    placeholder="Ej: Juan"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    maxLength={15}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir letras y espacios
                      if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) {
                        setFormData((prev) => ({ ...prev, lastName: value }));
                        clearError("lastName");
                      }
                    }}
                    onBlur={(e) =>
                      validate(
                        "lastName",
                        e.target.value,
                        getCommonRules("lastName")
                      )
                    }
                    className={getInputClasses(
                      !!errors.lastName,
                      isFieldReadOnly(
                        checkInType,
                        walkInGuestType,
                        formData.selectedGuestId
                      ) || hasLoadedReservationData
                    )}
                    required
                    readOnly={
                      isFieldReadOnly(
                        checkInType,
                        walkInGuestType,
                        formData.selectedGuestId
                      ) || hasLoadedReservationData
                    }
                    placeholder="Ej: Pérez"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    maxLength={40}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }));
                      clearError("email");
                    }}
                    onBlur={(e) =>
                      validate("email", e.target.value, getCommonRules("email"))
                    }
                    className={getInputClasses(
                      !!errors.email,
                      isFieldReadOnly(
                        checkInType,
                        walkInGuestType,
                        formData.selectedGuestId
                      ) || hasLoadedReservationData
                    )}
                    required
                    readOnly={
                      isFieldReadOnly(
                        checkInType,
                        walkInGuestType,
                        formData.selectedGuestId
                      ) || hasLoadedReservationData
                    }
                    placeholder="Ej: juan@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country={formData.phoneCountryCode}
                    value={formData.phone}
                    onChange={(phone) =>
                      setFormData((prev) => ({ ...prev, phone }))
                    }
                    inputProps={{
                      id: "phone",
                      name: "phone",
                      required: true,
                      readOnly:
                        isFieldReadOnly(
                          checkInType,
                          walkInGuestType,
                          formData.selectedGuestId
                        ) || hasLoadedReservationData,
                    }}
                    inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    id="nationality-label"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nacionalidad <span className="text-red-500">*</span>
                  </label>
                  <ReactFlagsSelect
                    selected={formData.nationality}
                    onSelect={(code) =>
                      setFormData((prev) => ({ ...prev, nationality: code }))
                    }
                    className="w-full"
                    selectButtonClassName="react-flags-select-button"
                    aria-labelledby="nationality-label"
                    aria-required="true"
                    disabled={
                      isFieldReadOnly(
                        checkInType,
                        walkInGuestType,
                        formData.selectedGuestId
                      ) || hasLoadedReservationData
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="identificationNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Número de Identificación{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="identificationNumber"
                    type="text"
                    value={formData.identificationNumber}
                    maxLength={25}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Solo permitir alfanumérico y guiones
                      if (/^[a-zA-Z0-9-]*$/.test(value)) {
                        setFormData((prev) => ({
                          ...prev,
                          identificationNumber: value,
                        }));
                        clearError("identificationNumber");
                      }
                    }}
                    onBlur={(e) =>
                      validate(
                        "identificationNumber",
                        e.target.value,
                        getCommonRules("identification")
                      )
                    }
                    className={getInputClasses(
                      !!errors.identificationNumber,
                      isFieldReadOnly(
                        checkInType,
                        walkInGuestType,
                        formData.selectedGuestId
                      ) || hasLoadedReservationData
                    )}
                    required
                    readOnly={
                      isFieldReadOnly(
                        checkInType,
                        walkInGuestType,
                        formData.selectedGuestId
                      ) || hasLoadedReservationData
                    }
                    placeholder="Ej: 123456789 o AB123456"
                  />
                  {errors.identificationNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.identificationNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Pago - Para ambos tipos */}
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información de Pago
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="paymentStatus"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Estado de Pago <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentStatus: e.target.value as
                          | "pending"
                          | "completed",
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="pending">Pendiente de Pago</option>
                    <option value="completed">Pago Completado</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="paymentMethod"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Método de Pago <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value as PaymentMethod,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar método de pago</option>
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Divisa de Pago
                  </label>
                  <CurrencySelector
                    value={formData.currency}
                    onChange={(currency) =>
                      setFormData((prev) => ({
                        ...prev,
                        currency,
                      }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Información de la Estancia */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Información de la Estancia
              </h2>

              {/* Fechas en la primera fila */}
              <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="checkInDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Fecha Llegada <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkInDate"
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          checkInDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="checkOutDate"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Fecha Salida <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="checkOutDate"
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          checkOutDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={formData.checkInDate}
                      required
                    />
                  </div>
                </div>

                {/* Composición de huéspedes en la segunda fila */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label
                      htmlFor="adultos"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Adultos <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="adultos"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.adultos}
                      onChange={(e) => {
                        const adults = Number.parseInt(e.target.value) || 1;
                        if (adults >= 1 && adults <= 20) {
                          setFormData((prev) => ({
                            ...prev,
                            adultos: adults,
                            numberOfGuests: adults + prev.ninos + prev.bebes,
                          }));
                          clearError("adultos");
                        }
                      }}
                      onBlur={(e) =>
                        validate(
                          "adultos",
                          e.target.value,
                          getCommonRules("adults")
                        )
                      }
                      className={getInputClasses(!!errors.adultos, false)}
                      required
                    />
                    {errors.adultos && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.adultos}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="ninos"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Niños
                    </label>
                    <input
                      id="ninos"
                      type="number"
                      min="0"
                      max="15"
                      value={formData.ninos}
                      onChange={(e) => {
                        const children = Number.parseInt(e.target.value) || 0;
                        if (children >= 0 && children <= 15) {
                          setFormData((prev) => ({
                            ...prev,
                            ninos: children,
                            numberOfGuests:
                              prev.adultos + children + prev.bebes,
                          }));
                          clearError("ninos");
                        }
                      }}
                      onBlur={(e) =>
                        validate(
                          "ninos",
                          e.target.value,
                          getCommonRules("children")
                        )
                      }
                      className={getInputClasses(!!errors.ninos, false)}
                    />
                    {errors.ninos && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.ninos}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="bebes"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Bebes
                    </label>
                    <input
                      id="bebes"
                      type="number"
                      min="0"
                      max="10"
                      value={formData.bebes}
                      onChange={(e) => {
                        const babies = Number.parseInt(e.target.value) || 0;
                        if (babies >= 0 && babies <= 10) {
                          setFormData((prev) => ({
                            ...prev,
                            bebes: babies,
                            numberOfGuests: prev.adultos + prev.ninos + babies,
                          }));
                          clearError("bebes");
                        }
                      }}
                      onBlur={(e) =>
                        validate(
                          "bebes",
                          e.target.value,
                          getCommonRules("babies")
                        )
                      }
                      className={getInputClasses(!!errors.bebes, false)}
                    />
                    {errors.bebes && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.bebes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Habitación en una sección separada */}
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    Seleccionar Habitación{" "}
                    <span className="text-red-500">*</span>
                  </h3>
                  {formData.roomNumber && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, roomNumber: "" }));
                        clearError("roomNumber");
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Barra de búsqueda */}
                <div className="relative mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="roomNumber"
                      type="text"
                      value={formData.roomNumber}
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Para la API, solo permitir números para habitación
                        if (/^\d*$/.test(value)) {
                          setFormData((prev) => ({
                            ...prev,
                            roomNumber: value,
                          }));
                          searchRoomSuggestions(value);
                          clearError("roomNumber");
                        }
                      }}
                      onFocus={() => {
                        setIsRoomEditable(true);
                        // Si está vacío, mostrar todas las habitaciones disponibles
                        if (!formData.roomNumber) {
                          searchRoomSuggestions("");
                        }
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Buscar por número de habitación o ver todas"
                    />
                  </div>
                  {errors.roomNumber && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.roomNumber}
                    </p>
                  )}
                </div>

                {/* Tarjetas visuales de habitaciones */}
                {isRoomEditable && roomSuggestions.length > 0 && (
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {roomSuggestions.map((roomNumber) => {
                      const isSelected = formData.roomNumber === roomNumber;
                      const totalGuests =
                        formData.adultos + formData.ninos + formData.bebes;

                      // Simple scoring based on room info (if available)
                      const getRoomScore = () => {
                        if (!roomInfo) return 0;
                        let score = 50; // Base score for available
                        const capacityDiff =
                          roomInfo.capacity.total - totalGuests;
                        if (capacityDiff >= 0 && capacityDiff <= 2) {
                          score += 30; // Perfect capacity
                        } else if (capacityDiff > 2) {
                          score += 15; // Larger room
                        }
                        return score;
                      };

                      const getSuitabilityLevel = () => {
                        const score = getRoomScore();
                        if (score >= 80) return "perfect";
                        if (score >= 60) return "good";
                        return "acceptable";
                      };

                      const getSuitabilityBorderClass = () => {
                        if (isSelected) return "border-blue-500 bg-blue-50";
                        const level = getSuitabilityLevel();
                        if (level === "perfect")
                          return "border-green-300 bg-green-50 hover:border-green-400";
                        if (level === "good")
                          return "border-blue-300 bg-blue-50 hover:border-blue-400";
                        return "border-gray-300 bg-white hover:border-gray-400";
                      };

                      const getSuitabilityBadge = () => {
                        const level = getSuitabilityLevel();
                        if (level === "perfect") {
                          return (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Perfecta
                            </div>
                          );
                        }
                        if (level === "good") {
                          return (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              <Star className="w-3 h-3" />
                              Muy Buena
                            </div>
                          );
                        }
                        return (
                          <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            <Info className="w-3 h-3" />
                            Disponible
                          </div>
                        );
                      };

                      return (
                        <button
                          key={roomNumber}
                          type="button"
                          onClick={() => {
                            selectRoom(roomNumber);
                            setFormData((prev) => ({
                              ...prev,
                              roomNumber: roomNumber,
                            }));
                            setIsRoomEditable(false);
                            clearError("roomNumber");
                          }}
                          className={`w-full p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${getSuitabilityBorderClass()}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  <Home className="w-5 h-5 text-gray-600" />
                                  <span className="font-semibold text-lg text-gray-900">
                                    Habitación #{roomNumber}
                                  </span>
                                </div>
                                {getSuitabilityBadge()}
                                {isSelected && (
                                  <div className="ml-auto">
                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                  </div>
                                )}
                              </div>

                              {roomNumber === formData.roomNumber &&
                                roomInfo && (
                                  <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                      <span className="text-sm text-gray-600">
                                        Tipo:
                                      </span>
                                      <p className="font-medium text-gray-800">
                                        {roomInfo.type}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-600">
                                        Capacidad:
                                      </span>
                                      <p className="font-medium text-gray-800">
                                        {roomInfo.capacity.total} personas
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-600">
                                        Piso:
                                      </span>
                                      <p className="font-medium text-gray-800">
                                        {roomInfo.floor}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-sm text-gray-600">
                                        Estado:
                                      </span>
                                      <p className="font-medium text-green-600">
                                        Disponible
                                      </p>
                                    </div>
                                  </div>
                                )}

                              {roomNumber === formData.roomNumber &&
                                roomInfo &&
                                totalGuests > 0 &&
                                (() => {
                                  const guestLabel =
                                    totalGuests > 1 ? "huéspedes" : "huésped";
                                  const capacityMessage =
                                    roomInfo.capacity.total >= totalGuests
                                      ? `✓ Capacidad suficiente para ${totalGuests} ${guestLabel}`
                                      : `⚠ Capacidad insuficiente (necesitas ${totalGuests} personas)`;

                                  return (
                                    <div className="mt-3 p-2 bg-white bg-opacity-60 rounded-md">
                                      <p className="text-xs text-gray-600">
                                        {capacityMessage}
                                      </p>
                                    </div>
                                  );
                                })()}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Mostrar mensaje si no hay habitaciones */}
                {isRoomEditable &&
                  formData.roomNumber.length > 0 &&
                  roomSuggestions.length === 0 && (
                    <div className="p-4 bg-white border border-gray-300 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            No se encontraron habitaciones
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            No hay habitaciones disponibles que coincidan con "
                            {formData.roomNumber}"
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            💡 Intenta limpiar el campo de búsqueda para ver
                            todas las habitaciones disponibles
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Mostrar cuando está vacío */}
                {!isRoomEditable && !formData.roomNumber && (
                  <div className="text-center py-8 text-gray-500">
                    <Home className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">
                      Haz clic en el campo de búsqueda para ver las habitaciones
                      disponibles
                    </p>
                  </div>
                )}

                {/* Habitación seleccionada - vista compacta */}
                {!isRoomEditable && formData.roomNumber && (
                  <div className="mt-2 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Habitación seleccionada</p>
                          <p className="text-lg font-bold text-gray-900">
                            #{formData.roomNumber}
                          </p>
                          {roomInfo && (
                            <p className="text-sm text-gray-700 mt-1">
                              {roomInfo.type} • Capacidad: {roomInfo.capacity.total} personas
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRoomEditable(true)}
                        className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                )}

                {/* Información adicional de la habitación */}
                {formData.roomNumber && (
                  <>{renderRoomInfoContent(loadingRoomInfo, roomInfo)}</>
                )}
              </div>

              {/* 👥 Gestión de Acompañantes */}
              <div className="mt-6 border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Acompañantes
                    <span className="text-sm font-normal text-gray-500">
                      ({formData.acompanantes.length})
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newAcompanante: Acompanante = {
                        id: `acomp-${Date.now()}`,
                        nombre: "",
                        documento: "",
                        email: "",
                      };
                      setFormData((prev) => ({
                        ...prev,
                        acompanantes: [...prev.acompanantes, newAcompanante],
                      }));
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Acompañante
                  </button>
                </div>

                {/* Selector de modo de pago */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modo de Pago
                  </label>
                  <select
                    value={formData.pago_modo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pago_modo: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="por_persona">
                      Por Persona (Individual)
                    </option>
                    <option value="general">Por Habitación (General)</option>
                  </select>

                  <p className="text-xs text-gray-500 mt-1">
                    {formData.pago_modo === "por_persona"
                      ? "Cada huésped pagará su parte proporcional."
                      : "El titular cubrirá todos los gastos de la habitación."}
                  </p>
                </div>

                {/* Lista de acompañantes */}
                {formData.acompanantes.length > 0 ? (
                  <div className="space-y-4">
                    {formData.acompanantes.map((acomp, index) => (
                      <div
                        key={acomp.id}
                        className="p-4 bg-white border border-gray-300 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            Acompañante {index + 1}
                            {acomp.isExisting && (
                              <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                Cliente Existente
                              </span>
                            )}
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                acompanantes: prev.acompanantes.filter(
                                  (a) => a.id !== acomp.id
                                ),
                              }));
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Eliminar acompañante"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre Completo{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={acomp.nombre}
                              onChange={(e) => {
                                const updatedAcompanantes =
                                  formData.acompanantes.map((a) =>
                                    a.id === acomp.id
                                      ? { ...a, nombre: e.target.value }
                                      : a
                                  );
                                setFormData((prev) => ({
                                  ...prev,
                                  acompanantes: updatedAcompanantes,
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: Carlos Méndez"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Documento <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={acomp.documento}
                              onChange={(e) => {
                                const updatedAcompanantes =
                                  formData.acompanantes.map((a) =>
                                    a.id === acomp.id
                                      ? { ...a, documento: e.target.value }
                                      : a
                                  );
                                setFormData((prev) => ({
                                  ...prev,
                                  acompanantes: updatedAcompanantes,
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: 304500789"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email (opcional)
                            </label>
                            <input
                              type="email"
                              value={acomp.email || ""}
                              onChange={(e) => {
                                const updatedAcompanantes =
                                  formData.acompanantes.map((a) =>
                                    a.id === acomp.id
                                      ? { ...a, email: e.target.value }
                                      : a
                                  );
                                setFormData((prev) => ({
                                  ...prev,
                                  acompanantes: updatedAcompanantes,
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="email@ejemplo.com"
                            />
                          </div>
                        </div>

                        {/* Opción para buscar cliente existente */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentAcompananteId(acomp.id);
                              setShowGuestSearchModal(true);
                              setGuestSearchQuery("");
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Search className="w-4 h-4" />
                            Buscar cliente existente
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-600 mb-2">
                      No hay acompañantes agregados
                    </p>
                    <p className="text-sm text-gray-500">
                      Haz clic en "Agregar Acompañante" para incluir más
                      huéspedes en esta reserva
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(ROUTES.FRONTDESK.BASE)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingWalkIn || isCreatingFolio}
                className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${getSubmitButtonStyles()}`}
              >
                {getSubmitButtonText()}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Búsqueda de Cliente para Acompañante */}
      {showGuestSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  Buscar Cliente Existente
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowGuestSearchModal(false);
                  setCurrentAcompananteId(null);
                  setGuestSearchQuery("");
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={guestSearchQuery}
                  onChange={(e) => {
                    setGuestSearchQuery(e.target.value);
                    if (e.target.value.length >= 2) {
                      searchGuests({
                        query: e.target.value,
                        isActive: true,
                        limit: 20,
                      });
                    }
                  }}
                  placeholder="Buscar por nombre, email o documento..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Escribe al menos 2 caracteres para buscar
              </p>
            </div>

            {/* Results */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {guestSearchQuery.length < 2 ? (
                <div className="text-center py-12 text-gray-500">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Comienza a buscar</p>
                  <p className="text-sm mt-2">
                    Ingresa el nombre, email o documento del cliente
                  </p>
                </div>
              ) : filteredGuestsForAcompanante.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                  <p className="text-lg font-medium">
                    No se encontraron clientes
                  </p>
                  <p className="text-sm mt-2">
                    No hay clientes que coincidan con "{guestSearchQuery}"
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredGuestsForAcompanante.map((guest) => {
                    const fullLastName = guest.secondLastName
                      ? `${guest.firstLastName} ${guest.secondLastName}`
                      : guest.firstLastName;

                    return (
                      <button
                        key={guest.id}
                        type="button"
                        onClick={() => handleSelectGuestAsAcompanante(guest)}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-5 h-5 text-gray-600" />
                              <span className="font-semibold text-gray-900">
                                {guest.firstName} {fullLastName}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Doc:</span>
                                {guest.documentNumber}
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Email:</span>
                                {guest.email}
                              </p>
                              {guest.phone && (
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">Tel:</span>
                                  {guest.phone}
                                </p>
                              )}
                            </div>
                          </div>
                          <CheckCircle className="w-6 h-6 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowGuestSearchModal(false);
                  setCurrentAcompananteId(null);
                  setGuestSearchQuery("");
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckIn;

