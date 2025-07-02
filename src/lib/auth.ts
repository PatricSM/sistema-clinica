import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase especial para operações de autenticação
// Usa a mesma configuração mas com contexto de service
const authSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://swnwsxfqndhcezshrivv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bndzeGZxbmRoY2V6c2hyaXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNjE0NjcsImV4cCI6MjA2NjYzNzQ2N30.k8NB4DFSDYpLtSFFR21C0wZLtEICCBxmqRiGdVAVoCg'
);

// Chave secreta para JWT - em produção, usar variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-2024';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'professional' | 'secretary' | 'patient';
  is_active: boolean;
  avatar_url?: string;
  last_login?: string;
  email_verified: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Hash da senha
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verificar senha
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Gerar JWT token
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isActive: user.is_active
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'sistema-clinica',
    audience: 'sistema-clinica-app'
  });
}

// Verificar JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'sistema-clinica',
      audience: 'sistema-clinica-app'
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Buscar usuário por email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await authSupabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.log('❌ Erro ao buscar usuário:', error);
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

// Buscar usuário por ID
export async function getUserById(id: number): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

// Atualizar último login
export async function updateLastLogin(userId: number): Promise<void> {
  try {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

// Fazer login
export async function authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { email, password } = credentials;
    console.log('🔐 Iniciando autenticação para:', email);

    // Validações básicas
    if (!email || !password) {
      console.log('❌ Dados incompletos - email ou senha em branco');
      return {
        success: false,
        message: 'Email e senha são obrigatórios'
      };
    }

    // Buscar usuário
    console.log('🔍 Buscando usuário por email...');
    const user = await getUserByEmail(email);
    if (!user) {
      console.log('❌ Usuário não encontrado para o email:', email);
      return {
        success: false,
        message: 'Credenciais inválidas'
      };
    }
    
    console.log('✅ Usuário encontrado:', { id: user.id, email: user.email, role: user.role });

    // Verificar se a conta está ativa
    if (!user.is_active) {
      return {
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.'
      };
    }

    // Verificar senha
    console.log('🔒 Verificando senha...');
    const { data: userWithPassword } = await authSupabase
      .from('users')
      .select('password_hash')
      .eq('id', user.id)
      .single();

    if (!userWithPassword?.password_hash) {
      console.log('❌ Hash da senha não encontrado no banco');
      return {
        success: false,
        message: 'Credenciais inválidas'
      };
    }
    
    console.log('🔍 Hash encontrado, comparando senhas...');
    const isPasswordValid = await verifyPassword(password, userWithPassword.password_hash);
    console.log('🔑 Resultado da verificação de senha:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Senha inválida para o usuário:', email);
      return {
        success: false,
        message: 'Credenciais inválidas'
      };
    }

    // Atualizar último login
    await updateLastLogin(user.id);

    // Gerar token
    const token = generateToken(user);

    return {
      success: true,
      user,
      token,
      message: 'Login realizado com sucesso'
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'Erro interno do servidor'
    };
  }
}

// Validar token de autorização
export async function validateAuthToken(token: string): Promise<User | null> {
  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return null;
    }

    const user = await getUserById(decoded.userId);
    if (!user || !user.is_active) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

// Verificar permissões
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Validar força da senha
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
  }

  if (!/\d/.test(password)) {
    return { valid: false, message: 'Senha deve conter pelo menos um número' };
  }

  return { valid: true };
} 