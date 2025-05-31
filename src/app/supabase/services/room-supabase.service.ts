import { Injectable } from '@angular/core';
import { Room } from '../../models/room';
import { supabase } from '../../supabaseClient';

@Injectable({ providedIn: 'root' })
export class RoomSupabaseService {
  private table = 'rooms';

  async getRooms(): Promise<Room[] | null> {
    const { data, error } = await supabase.from(this.table).select('*');
    if (error) throw error;
    return data;
  }

  async addRoom(room: Omit<Room, 'id'>): Promise<void> {
    const { error } = await supabase.from(this.table).insert(room);
    if (error) throw error;
  }

  async updateRoom(room: Room): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .update(room)
      .eq('id', room.id);
    if (error) throw error;
  }

  async deleteRoom(id: number): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw error;
  }
}
