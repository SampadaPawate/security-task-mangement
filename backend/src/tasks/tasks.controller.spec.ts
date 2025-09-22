import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { RbacService } from '../auth/rbac.service';

describe('TasksController', () => {
  let controller: TasksController;
  let mockTasksService: any;
  let mockRbacService: any;

  beforeEach(async () => {
    mockTasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockRbacService = {
      hasPermission: jest.fn(),
      canAccessTask: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: RbacService,
          useValue: mockRbacService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 1,
      };

      const mockUser = { id: 1, role: 'admin', organizationId: 1 };
      const mockTask = { id: 1, ...createTaskDto, createdById: 1 };

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto, mockUser);

      expect(mockTasksService.create).toHaveBeenCalledWith(createTaskDto, 1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return all accessible tasks', async () => {
      const mockUser = { id: 1, role: 'admin', organizationId: 1 };
      const mockTasks = [
        { id: 1, title: 'Task 1', createdById: 1 },
        { id: 2, title: 'Task 2', createdById: 2 },
      ];

      mockTasksService.findAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll(mockUser);

      expect(mockTasksService.findAll).toHaveBeenCalledWith(1, 'admin', 1);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('findOne', () => {
    it('should return a specific task', async () => {
      const mockUser = { id: 1, role: 'admin', organizationId: 1 };
      const mockTask = { id: 1, title: 'Test Task', createdById: 1 };

      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(1, mockUser);

      expect(mockTasksService.findOne).toHaveBeenCalledWith(1, 1, 'admin', 1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto = { title: 'Updated Task' };
      const mockUser = { id: 1, role: 'admin', organizationId: 1 };
      const mockTask = { id: 1, ...updateTaskDto, createdById: 1 };

      mockTasksService.update.mockResolvedValue(mockTask);

      const result = await controller.update(1, updateTaskDto, mockUser);

      expect(mockTasksService.update).toHaveBeenCalledWith(1, updateTaskDto, 1, 'admin');
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const mockUser = { id: 1, role: 'admin', organizationId: 1 };

      mockTasksService.remove.mockResolvedValue(undefined);

      await controller.remove(1, mockUser);

      expect(mockTasksService.remove).toHaveBeenCalledWith(1, 1, 'admin');
    });
  });
});

