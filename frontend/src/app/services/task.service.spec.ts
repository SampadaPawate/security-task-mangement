import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService, Task } from './task.service';
import { AuthService } from './auth.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TaskService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    mockAuthService.getToken.and.returnValue('mock-jwt-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('should return tasks with authorization header', () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test Task 1',
          description: 'Description 1',
          status: 'todo',
          priority: 1,
          createdById: 1,
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01'
        },
        {
          id: 2,
          title: 'Test Task 2',
          description: 'Description 2',
          status: 'completed',
          priority: 2,
          createdById: 1,
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01'
        }
      ];

      service.getTasks().subscribe(tasks => {
        expect(tasks).toEqual(mockTasks);
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      req.flush(mockTasks);
    });
  });

  describe('getTask', () => {
    it('should return single task', () => {
      const mockTask: Task = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 1,
        createdById: 1,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };

      service.getTask(1).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });
  });

  describe('createTask', () => {
    it('should create new task', () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        priority: 1
      };

      const mockCreatedTask: Task = {
        id: 3,
        title: 'New Task',
        description: 'New Description',
        status: 'todo',
        priority: 1,
        createdById: 1,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };

      service.createTask(newTask).subscribe(task => {
        expect(task).toEqual(mockCreatedTask);
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTask);
      req.flush(mockCreatedTask);
    });
  });

  describe('updateTask', () => {
    it('should update existing task', () => {
      const updateData = { title: 'Updated Task' };
      const mockUpdatedTask: Task = {
        id: 1,
        title: 'Updated Task',
        description: 'Test Description',
        status: 'todo',
        priority: 1,
        createdById: 1,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      };

      service.updateTask(1, updateData).subscribe(task => {
        expect(task).toEqual(mockUpdatedTask);
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockUpdatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete task', () => {
      service.deleteTask(1).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('http://localhost:3000/tasks/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});

