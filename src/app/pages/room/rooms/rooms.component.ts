import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Room } from '../../../models/room';
import { SupabaseClient } from '@supabase/supabase-js';
import { RoomSupabaseService } from '../../../supabase/services/room-supabase.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  rooms: Room[] = [];
  newRoom: Partial<Room> = {};
  selectedRoom: Room = {} as Room;
  roomDialog = false;
  editDialog = false;
  submitted = false;

  constructor(private roomService: RoomSupabaseService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  async loadRooms() {
    try {
      const result = await this.roomService.getRooms();
      this.rooms = result ?? []; // fallback si null
    } catch (error) {
      console.error('Erreur lors du chargement des chambres :', error);
    }
  }

  openNewDialog() {
    this.newRoom = {};
    this.submitted = false;
    this.roomDialog = true;
  }

  async saveRoom() {
    this.submitted = true;
    if (this.newRoom.room_number && this.newRoom.capacity !== undefined) {
      const room: Omit<Room, 'id'> = {
        room_number: this.newRoom.room_number,
        capacity: this.newRoom.capacity,
        occupied_beds: this.newRoom.occupied_beds ?? 0
      };
      await this.roomService.addRoom(room);
      this.roomDialog = false;
      this.loadRooms();
    }
  }

  editRoom(room: Room) {
    this.selectedRoom = { ...room };
    this.editDialog = true;
  }

  async updateRoom() {
    await this.roomService.updateRoom(this.selectedRoom);
    this.editDialog = false;
    this.loadRooms();
  }

  async deleteRoom(id: number) {
    await this.roomService.deleteRoom(id);
    this.loadRooms();
  }

  onGlobalFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.table.filterGlobal(value, 'contains');
  }
}
