import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../services/auth.service';
import { TaskService } from '../services/task.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'createTask', 'updateTask', 'deleteTask']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockTaskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    mockAuthService.getCurrentUser.and.returnValue({
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin'
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with current user', () => {
    expect(component.currentUser).toEqual({
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'admin'
    });
  });

  it('should load tasks on init', () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'todo', priority: 1, createdById: 1, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: 2, title: 'Task 2', status: 'completed', priority: 2, createdById: 1, createdAt: '2023-01-01', updatedAt: '2023-01-01' }
    ];

    mockTaskService.getTasks.and.returnValue(of(mockTasks));

    component.ngOnInit();

    expect(mockTaskService.getTasks).toHaveBeenCalled();
    expect(component.tasks).toEqual(mockTasks);
  });

  it('should create task when form is valid', () => {
    const newTask = {
      id: 3,
      title: 'New Task',
      description: 'New Description',
      status: 'todo',
      priority: 1,
      createdById: 1,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };

    component.taskForm.patchValue({
      title: 'New Task',
      description: 'New Description',
      priority: 1
    });

    mockTaskService.createTask.and.returnValue(of(newTask));

    component.createTask();

    expect(mockTaskService.createTask).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'New Description',
      priority: 1
    });
    expect(component.tasks[0]).toEqual(newTask);
    expect(component.errorMessage).toBe('');
  });

  it('should not create task when form is invalid', () => {
    component.taskForm.patchValue({
      title: '', // Invalid - empty title
      description: 'Description',
      priority: 1
    });

    component.createTask();

    expect(mockTaskService.createTask).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Please fill in all required fields correctly.');
  });

  it('should handle task creation error', () => {
    component.taskForm.patchValue({
      title: 'New Task',
      description: 'New Description',
      priority: 1
    });

    const error = { error: { message: 'Permission denied' } };
    mockTaskService.createTask.and.returnValue(throwError(() => error));

    component.createTask();

    expect(component.errorMessage).toBe('Permission denied');
  });

  it('should toggle task status', () => {
    const task = {
      id: 1,
      title: 'Task 1',
      status: 'todo',
      priority: 1,
      createdById: 1,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };

    const updatedTask = { ...task, status: 'completed' };
    mockTaskService.updateTask.and.returnValue(of(updatedTask));

    component.tasks = [task];
    component.toggleTaskStatus(task);

    expect(mockTaskService.updateTask).toHaveBeenCalledWith(1, { status: 'completed' });
    expect(component.tasks[0]).toEqual(updatedTask);
  });

  it('should delete task with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    
    const task = {
      id: 1,
      title: 'Task 1',
      status: 'todo',
      priority: 1,
      createdById: 1,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };

    mockTaskService.deleteTask.and.returnValue(of(undefined));

    component.tasks = [task];
    component.deleteTask(1);

    expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1);
    expect(component.tasks).toEqual([]);
  });

  it('should not delete task without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    
    const task = {
      id: 1,
      title: 'Task 1',
      status: 'todo',
      priority: 1,
      createdById: 1,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    };

    component.tasks = [task];
    component.deleteTask(1);

    expect(mockTaskService.deleteTask).not.toHaveBeenCalled();
    expect(component.tasks).toEqual([task]);
  });

  it('should logout and navigate to login', () => {
    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      component.tasks = [
        { id: 1, title: 'Task 1', status: 'completed', priority: 1, createdById: 1, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: 2, title: 'Task 2', status: 'completed', priority: 2, createdById: 1, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: 3, title: 'Task 3', status: 'in_progress', priority: 3, createdById: 1, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: 4, title: 'Task 4', status: 'todo', priority: 4, createdById: 1, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        { id: 5, title: 'Task 5', status: 'todo', priority: 5, createdById: 1, createdAt: '2023-01-01', updatedAt: '2023-01-01' }
      ];
    });

    it('should count completed tasks', () => {
      expect(component.getCompletedTasksCount()).toBe(2);
    });

    it('should count in progress tasks', () => {
      expect(component.getInProgressTasksCount()).toBe(1);
    });

    it('should count high priority tasks', () => {
      expect(component.getHighPriorityTasksCount()).toBe(2);
    });
  });

  it('should track by task id', () => {
    const task = { id: 1, title: 'Task 1', status: 'todo', priority: 1, createdById: 1, createdAt: '2023-01-01', updatedAt: '2023-01-01' };
    expect(component.trackByTaskId(0, task)).toBe(1);
  });
});

