import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  authForm: FormGroup;
  isLoginMode = true;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.authForm = this.createForm();
  }

  private createForm(): FormGroup {
    const formControls: any = {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    };

    if (!this.isLoginMode) {
      formControls.firstName = ['', [Validators.required]];
      formControls.lastName = ['', [Validators.required]];
      formControls.role = ['viewer']; // Default role for testing
    }

    return this.formBuilder.group(formControls);
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.authForm = this.createForm();
    this.errorMessage = '';
  }


  onSubmit(): void {
    if (this.authForm.valid) {
      const formData = this.authForm.value;

      const authObservable = this.isLoginMode
        ? this.authService.login(formData)
        : this.authService.register({
            ...formData,
            role: formData.role || 'viewer'
          });

      authObservable.subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        }
      });
    }
  }
}
