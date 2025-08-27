# Front Desk Module - API Integration

This module handles check-in operations with reservation search functionality. It's designed to work with both mock data (for development) and real API endpoints (for production).

## API Integration

### Environment Configuration

The system can switch between mock and real API using environment variables:

```bash
# .env.local (for development with mock data)
VITE_USE_REAL_API=false

# .env.production (for production with real API)
VITE_USE_REAL_API=true
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### API Endpoints

When using real API (`VITE_USE_REAL_API=true`), the system expects these endpoints:

#### Reservation Search
- **GET** `/api/reservations/search?confirmationNumber={confirmationNumber}`
- **GET** `/api/reservations/search?lastName={lastName}&documentNumber={documentNumber}`

#### Check-in Processing
- **POST** `/api/check-ins`
- **GET** `/api/check-ins/recent`

#### Health Check
- **GET** `/api/health`

### API Response Formats

#### Reservation Search Response
```json
{
  "id": "res-001",
  "guest": {
    "id": "guest-001",
    "firstName": "María",
    "lastName": "González",
    "email": "maria.gonzalez@email.com",
    "phone": "8888-1234",
    "documentType": "id",
    "documentNumber": "1-1234-5678"
  },
  "checkInDate": "2025-08-26",
  "checkOutDate": "2025-08-28",
  "numberOfGuests": 2,
  "numberOfNights": 2,
  "roomType": "double",
  "roomId": "room-003",
  "additionalServices": ["service-breakfast-continental"],
  "subtotal": 130000,
  "servicesTotal": 33500,
  "taxes": 21255,
  "total": 184755,
  "depositRequired": 92377.5,
  "specialRequests": "Habitación en piso alto con vista al mar",
  "status": "confirmed",
  "createdAt": "2025-08-25T10:30:00Z",
  "updatedAt": "2025-08-25T10:30:00Z",
  "confirmationNumber": "CONF-ABC123"
}
```

#### Check-in Request
```json
{
  "reservationId": "res-001",
  "roomNumber": "101",
  "checkInDate": "2025-08-26T15:00:00",
  "numberOfGuests": 2,
  "identificationNumber": "1-1234-5678",
  "paymentStatus": "completed"
}
```

#### Check-in Response
```json
{
  "success": true,
  "checkInId": "checkin-001"
}
```

### Error Handling

The system handles various error scenarios:

1. **404 Not Found**: Reservation doesn't exist
2. **Network Errors**: Connection issues, timeouts
3. **Server Errors**: 5xx HTTP status codes
4. **Authentication Errors**: 401/403 status codes

### Authentication

The API service automatically includes authentication tokens from localStorage:

```javascript
// Token is automatically added to requests
const token = localStorage.getItem('authToken');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### Retry Logic

The system implements intelligent retry logic:

- **Retries**: Up to 2 attempts for network errors
- **No Retry**: For 404 (not found) errors
- **Backoff**: Exponential backoff with max 30-second delay

### Development vs Production

#### Development Mode (Mock Data)
- Uses local JSON files for testing
- Simulates API delays
- No network requests
- Perfect for development and testing

#### Production Mode (Real API)
- Makes actual HTTP requests
- Includes authentication
- Handles real error scenarios
- Production-ready error handling

### Testing the Integration

1. **With Mock Data**: Set `VITE_USE_REAL_API=false`
2. **With Real API**: Set `VITE_USE_REAL_API=true` and configure your API URL

### Sample Test Data

For testing with mock data, use these sample reservations:

- **Confirmation**: `CONF-ABC123`
- **Guest**: Last Name: `González`, ID: `1-1234-5678`

- **Confirmation**: `CONF-XYZ789`  
- **Guest**: Last Name: `Rodríguez`, ID: `P123456789`
