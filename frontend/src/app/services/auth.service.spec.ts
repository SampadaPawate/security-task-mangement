import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login user and store token', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'admin'
        }
      };

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('access_token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('current_user')).toBe(JSON.stringify(mockResponse.user));
      });

      const req = httpMock.expectOne('http://localhost:3000/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      const mockError = { error: { message: 'Invalid credentials' } };

      service.login(credentials).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.error).toEqual(mockError.error);
        }
      });

      const req = httpMock.expectOne('http://localhost:3000/auth/login');
      req.flush(mockError, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register user and store token', () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'viewer'
      };
      const mockResponse = {
        access_token: 'mock-jwt-token',
        user: {
          id: 2,
          email: 'new@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'viewer'
        }
      };

      service.register(userData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('access_token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('current_user')).toBe(JSON.stringify(mockResponse.user));
      });

      const req = httpMock.expectOne('http://localhost:3000/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear localStorage and navigate to login', () => {
      localStorage.setItem('access_token', 'mock-token');
      localStorage.setItem('current_user', '{"id": 1}');

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('access_token', 'mock-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from localStorage', () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'admin' };
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      // Need to trigger the constructor behavior
      const newService = new AuthService(service['http'], service['router']);
      expect(newService.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null when no user in localStorage', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('access_token', 'mock-token');
      expect(service.getToken()).toBe('mock-token');
    });

    it('should return null when no token in localStorage', () => {
      expect(service.getToken()).toBeNull();
    });
  });
});

