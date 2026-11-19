export interface GroupClass {
  id: number;
  name: string;
  capacity: number;
  startTime: string | Date;
  endTime: string | Date;
  _count?: {
    bookings?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassDto {
  name: string;
  capacity: number;
  startTime: string | Date;
  endTime: string | Date;
}

export type ClassCreateInput = CreateClassDto;

export interface UpdateClassDto extends Partial<CreateClassDto> {}
