import axios from "axios";
import type { Staff } from "../types/typesRoom";

export async function fetchStaff() {
  try {
    const response = await axios.get<Staff[]>("https://68af252bb91dfcdd62bb84e5.mockapi.io/housekeepingStaff");
    return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
}