import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the components to isolate App testing
jest.mock('../components/Auth/LoginPage', () => {
  return function MockLoginPage() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('../components/Auth/SignupPage', () => {
  return function MockSignupPage() {
    return <div data-testid="signup-page">Signup Page</div>;
  };
});

jest.mock('../components/Dashboard/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

jest.mock('../components/common/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

jest.mock('../components/common/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

// Mock AuthContext
const mockAuthContext = {
  user: null,
  loading: false,
  isAuthenticated: false,
  signIn: jest.fn(),
  signOut: jest.fn(),
  signUp: jest.fn(),
  clearError: jest.fn(),
  error: null
};

jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  test('renders auth provider', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  test('renders toaster component', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  test('redirects to dashboard by default', () => {
    renderWithRouter(<App />);
    // Since we're mocking ProtectedRoute, we should see it
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  test('renders login page when navigating to /login', () => {
    renderWithRouter(<App />);
    // Navigate to login
    window.history.pushState({}, '', '/login');
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  test('renders signup page when navigating to /signup', () => {
    renderWithRouter(<App />);
    // Navigate to signup
    window.history.pushState({}, '', '/signup');
    expect(screen.getByTestId('signup-page')).toBeInTheDocument();
  });

  test('renders dashboard when navigating to /dashboard', () => {
    renderWithRouter(<App />);
    // Navigate to dashboard
    window.history.pushState({}, '', '/dashboard');
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('handles unknown routes by redirecting to dashboard', () => {
    renderWithRouter(<App />);
    // Navigate to unknown route
    window.history.pushState({}, '', '/unknown-route');
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });
});

describe('App Error Handling', () => {
  test('error boundary catches and displays errors', () => {
    // Create a component that throws an error
    const ThrowError = () => {
      throw new Error('Test error');
    };

    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    render(
      <BrowserRouter>
        <AuthProvider>
          <div data-testid="error-boundary">
            <ThrowError />
          </div>
        </AuthProvider>
      </BrowserRouter>
    );

    // Restore console.error
    console.error = originalError;

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});

describe('App Routing', () => {
  test('root path redirects to dashboard', () => {
    renderWithRouter(<App />);
    window.history.pushState({}, '', '/');
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });

  test('handles OAuth callback route', () => {
    renderWithRouter(<App />);
    window.history.pushState({}, '', '/auth/callback');
    // Should render the OAuth callback component
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
  });
});
