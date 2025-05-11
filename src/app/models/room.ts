export interface Room {
  id: number;
  room_number: string;
  capacity: number;
  occupied_beds: number; // ✅ nom identique à la BDD Supabase
}
