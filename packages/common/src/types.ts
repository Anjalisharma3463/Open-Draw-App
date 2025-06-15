import {z} from 'zod';

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6).max(50),
  name: z.string().min(3).max(50)
});

export const SignSchema = z.object({
  username: z.string().min(3).max(20),
    password: z.string().min(6).max(50)
});

export const CreateRoomSchema = z.object({
  roomName: z.string().min(3).max(50)
});