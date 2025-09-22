import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService, User } from '../services/auth.service';
import { TaskService, Task } from '../services/task.service';
import { Router } from '@angular/router';
import { TaskChartComponent } from '../components/task-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TaskChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  taskForm: FormGroup;
  errorMessage: string = '';
  
  // Filter and sort properties
  filterStatus: string = 'all';
  filterPriority: string = 'all';
  sortBy: string = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  searchTerm: string = '';
  
  // Categorized tasks for drag-drop
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  completedTasks: Task[] = [];
  
  // Dark mode
  isDarkMode: boolean = false;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.taskForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: [1]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    
    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedDarkMode === 'true';
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = error.error?.message || 'Failed to load tasks.';
      }
    });
  }

  createTask(): void {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;
      console.log('Creating task with data:', taskData);
      
      this.taskService.createTask(taskData).subscribe({
        next: (newTask) => {
          console.log('Task created successfully:', newTask);
          this.tasks.unshift(newTask);
          this.taskForm.reset();
          this.taskForm.patchValue({ priority: 1 });
          this.errorMessage = ''; // Clear any previous error
          this.applyFilters(); // Apply filters to show new task
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.errorMessage = error.error?.message || 'Failed to create task. Please try again.';
        }
      });
    } else {
      console.log('Form is invalid:', this.taskForm.errors);
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  toggleTaskStatus(task: Task): void {
    const newStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    
    this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
      },
      error: (error) => {
        console.error('Error updating task:', error);
      }
    });
  }

  deleteTask(taskId: number): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Helper methods for statistics
  getCompletedTasksCount(): number {
    return this.tasks.filter(task => task.status === 'completed').length;
  }

  getInProgressTasksCount(): number {
    return this.tasks.filter(task => task.status === 'in_progress').length;
  }

  getHighPriorityTasksCount(): number {
    return this.tasks.filter(task => task.priority >= 4).length;
  }

  // Filter and sort methods
  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesStatus = this.filterStatus === 'all' || task.status === this.filterStatus;
      const matchesPriority = this.filterPriority === 'all' || task.priority.toString() === this.filterPriority;
      const matchesSearch = !this.searchTerm || 
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesStatus && matchesPriority && matchesSearch;
    });

    this.sortTasks();
    this.categorizeTasks();
  }

  sortTasks(): void {
    this.filteredTasks.sort((a, b) => {
      let aValue: any = a[this.sortBy as keyof Task];
      let bValue: any = b[this.sortBy as keyof Task];

      if (this.sortBy === 'createdAt' || this.sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  categorizeTasks(): void {
    this.todoTasks = this.filteredTasks.filter(task => task.status === 'todo');
    this.inProgressTasks = this.filteredTasks.filter(task => task.status === 'in_progress');
    this.completedTasks = this.filteredTasks.filter(task => task.status === 'completed');
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  // Task status change functionality
  changeTaskStatus(task: Task, newStatus: string): void {
    if (task.status !== newStatus) {
      this.updateTaskStatus(task, newStatus);
    }
  }

  updateTaskStatus(task: Task, newStatus: string): void {
    this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        // Revert the drag operation on error
        this.applyFilters();
      }
    });
  }

  // Dark mode toggle
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  // Keyboard shortcuts
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'n':
          event.preventDefault();
          document.getElementById('task-title')?.focus();
          break;
        case 'k':
          event.preventDefault();
          document.getElementById('search-input')?.focus();
          break;
        case 'd':
          event.preventDefault();
          this.toggleDarkMode();
          break;
      }
    }
  }
}
