import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  "https://rntcoumqzcopargmjqxm.supabase.co";
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJudGNvdW1xemNvcGFyZ21qcXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODg3MTYsImV4cCI6MjA3MTA2NDcxNn0.VQdxbasSiBiuRs4biqL2bh97PUlvI3_zVNzRW1GKq0g";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      return { user: null, error };
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      return { session: null, error };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },
};

export default supabase;

// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl =
//   process.env.REACT_APP_SUPABASE_URL ||
//   "https://xmalekyzfnomtqxdkoqh.supabase.co";
// const supabaseAnonKey =
//   process.env.REACT_APP_SUPABASE_ANON_KEY ||
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtYWxla3l6Zm5vbXRxeGRrb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDUxMjYsImV4cCI6MjA3MzQyMTEyNn0.Hz8YXkEzfMerw-NAe0xI-q-GVMb7vmZGcMZO9Un9p1s";

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // figure out redirect URL based on environment
// const redirectUrl =
//   process.env.NODE_ENV === "production"
//     ? "https://horizon-five-iota.vercel.app/auth/callback" // 🔹 change this to your actual Vercel domain
//     : "http://localhost:3000/auth/callback";

// export const auth = {
//   // Sign up with email and password
//   signUp: async (email, password) => {
//     try {
//       const { data, error } = await supabase.auth.signUp({ email, password });
//       return { data, error };
//     } catch (error) {
//       return { data: null, error };
//     }
//   },

//   // Sign in with email and password
//   signIn: async (email, password) => {
//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });
//       return { data, error };
//     } catch (error) {
//       return { data: null, error };
//     }
//   },

//   // Sign out
//   signOut: async () => {
//     try {
//       const { error } = await supabase.auth.signOut();
//       return { error };
//     } catch (error) {
//       return { error };
//     }
//   },

//   // Get current user
//   getCurrentUser: async () => {
//     try {
//       const {
//         data: { user },
//         error,
//       } = await supabase.auth.getUser();
//       return { user, error };
//     } catch (error) {
//       return { user: null, error };
//     }
//   },

//   // Get current session
//   getSession: async () => {
//     try {
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();
//       return { session, error };
//     } catch (error) {
//       return { session: null, error };
//     }
//   },

//   // Reset password
//   resetPassword: async (email) => {
//     try {
//       const { data, error } = await supabase.auth.resetPasswordForEmail(email);
//       return { data, error };
//     } catch (error) {
//       return { data: null, error };
//     }
//   },

//   // Sign in with Google
//   signInWithGoogle: async () => {
//     try {
//       const { data, error } = await supabase.auth.signInWithOAuth({
//         provider: "google",
//         options: {
//           redirectTo: redirectUrl,
//         },
//       });
//       return { data, error };
//     } catch (error) {
//       return { data: null, error };
//     }
//   },
// };

// export default supabase;
