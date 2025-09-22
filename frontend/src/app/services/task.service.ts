import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: number;
  dueDate?: string;
  assignedToId?: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token for API request:', token ? 'Token exists' : 'No token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/tasks`, {
      headers: this.getHeaders()
    });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/tasks/${id}`, {
      headers: this.getHeaders()
    });
  }

  createTask(task: any): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/tasks`, task, {
      headers: this.getHeaders()
    });
  }

  updateTask(id: number, task: any): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/tasks/${id}`, task, {
      headers: this.getHeaders()
    });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tasks/${id}`, {
      headers: this.getHeaders()
    });
  }
}
