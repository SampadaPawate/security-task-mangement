import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      });
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      };

      // Mock validateUser to return the user without password
      jest.spyOn(service, 'validateUser').mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      });

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login('test@example.com', 'password123');

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: 1,
        role: 'admin',
      });
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'admin',
        },
      });
    });
  });

  describe('register', () => {
    it('should create and return new user with access token', async () => {
      const email = 'new@example.com';
      const password = 'password123';
      const firstName = 'Jane';
      const lastName = 'Doe';

      const mockUser = {
        id: 1,
        email,
        password: 'hashedPassword',
        firstName,
        lastName,
        role: 'viewer',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.register(email, password, firstName, lastName, 'viewer');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email,
        password: expect.any(String), // hashed password
        firstName,
        lastName,
        role: 'viewer',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          email,
          firstName,
          lastName,
          role: 'viewer',
        },
      });
    });

    it('should throw error when user already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';
      const firstName = 'John';
      const lastName = 'Doe';

      mockUserRepository.findOne.mockResolvedValue({ id: 1, email });

      await expect(service.register(email, password, firstName, lastName, 'admin')).rejects.toThrow('User with this email already exists');
    });
  });
});

