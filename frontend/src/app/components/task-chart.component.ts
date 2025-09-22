import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../services/task.service';

@Component({
  selector: 'app-task-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Task Progress Visualization</h3>
      
      <!-- Progress Bars -->
      <div class="space-y-4">
        <!-- Completion Rate -->
        <div>
          <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
            <span>Completion Rate</span>
            <span>{{ getCompletionRate() }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              class="bg-green-500 h-2 rounded-full transition-all duration-300"
              [style.width.%]="getCompletionRate()"
            ></div>
          </div>
        </div>

        <!-- Status Distribution -->
        <div class="grid grid-cols-3 gap-4 mt-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-400 dark:text-gray-500">{{ getTodoCount() }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-300">To Do</div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
              <div 
                class="bg-gray-400 h-1 rounded-full"
                [style.width.%]="getTodoPercentage()"
              ></div>
            </div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-500">{{ getInProgressCount() }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
              <div 
                class="bg-yellow-400 h-1 rounded-full"
                [style.width.%]="getInProgressPercentage()"
              ></div>
            </div>
          </div>
          
          <div class="text-center">
            <div class="text-2xl font-bold text-green-500">{{ getCompletedCount() }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-300">Completed</div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
              <div 
                class="bg-green-400 h-1 rounded-full"
                [style.width.%]="getCompletedPercentage()"
              ></div>
            </div>
          </div>
        </div>

        <!-- Priority Distribution -->
        <div class="mt-6">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Priority Distribution</h4>
          <div class="grid grid-cols-5 gap-2">
            <div *ngFor="let priority of [1,2,3,4,5]; let i = index" class="text-center">
              <div class="text-lg font-semibold"
                   [class]="getPriorityColor(priority)">
                {{ getPriorityCount(priority) }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">P{{ priority }}</div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                <div 
                  class="h-1 rounded-full"
                  [class]="getPriorityBarColor(priority)"
                  [style.width.%]="getPriorityPercentage(priority)"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Productivity Stats -->
        <div class="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="text-center">
            <div class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ getAveragePriority() }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-300">Avg Priority</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-purple-600 dark:text-purple-400">{{ getTotalTasks() }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-300">Total Tasks</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TaskChartComponent implements OnInit {
  @Input() tasks: Task[] = [];

  ngOnInit(): void {}

  getCompletionRate(): number {
    if (this.tasks.length === 0) return 0;
    const completed = this.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completed / this.tasks.length) * 100);
  }

  getTodoCount(): number {
    return this.tasks.filter(task => task.status === 'todo').length;
  }

  getInProgressCount(): number {
    return this.tasks.filter(task => task.status === 'in_progress').length;
  }

  getCompletedCount(): number {
    return this.tasks.filter(task => task.status === 'completed').length;
  }

  getTodoPercentage(): number {
    if (this.tasks.length === 0) return 0;
    return (this.getTodoCount() / this.tasks.length) * 100;
  }

  getInProgressPercentage(): number {
    if (this.tasks.length === 0) return 0;
    return (this.getInProgressCount() / this.tasks.length) * 100;
  }

  getCompletedPercentage(): number {
    if (this.tasks.length === 0) return 0;
    return (this.getCompletedCount() / this.tasks.length) * 100;
  }

  getPriorityCount(priority: number): number {
    return this.tasks.filter(task => task.priority === priority).length;
  }

  getPriorityPercentage(priority: number): number {
    if (this.tasks.length === 0) return 0;
    return (this.getPriorityCount(priority) / this.tasks.length) * 100;
  }

  getPriorityColor(priority: number): string {
    switch (priority) {
      case 1: return 'text-gray-500 dark:text-gray-400';
      case 2: return 'text-blue-500 dark:text-blue-400';
      case 3: return 'text-yellow-500 dark:text-yellow-400';
      case 4: return 'text-orange-500 dark:text-orange-400';
      case 5: return 'text-red-500 dark:text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  }

  getPriorityBarColor(priority: number): string {
    switch (priority) {
      case 1: return 'bg-gray-400';
      case 2: return 'bg-blue-400';
      case 3: return 'bg-yellow-400';
      case 4: return 'bg-orange-400';
      case 5: return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  }

  getAveragePriority(): number {
    if (this.tasks.length === 0) return 0;
    const totalPriority = this.tasks.reduce((sum, task) => sum + task.priority, 0);
    return Math.round((totalPriority / this.tasks.length) * 10) / 10;
  }

  getTotalTasks(): number {
    return this.tasks.length;
  }
}

