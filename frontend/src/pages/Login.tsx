import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [nome, setNome] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { addNotification } = useNotification();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      addNotification({
        message: 'Login realizado com sucesso!',
        type: 'success',
      });
      navigate('/');
    } catch (error: any) {
      console.error('Erro no login:', error);
      const errorMessage =
        error.response?.data?.message || 'Falha ao fazer login. Verifique suas credenciais.';
      addNotification({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(nome, email, password);
      addNotification({
        message: 'Cadastro realizado com sucesso! Bem-vindo!',
        type: 'success',
      });
      navigate('/');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      const errorMessage =
        error.response?.data?.message || 'Falha ao realizar cadastro.';
      addNotification({
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setEmail('');
    setPassword('');
    setNome('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">🚗</div>
        <h1>AutoGestão</h1>
        <p className="login-subtitle">
          {isRegisterMode
            ? 'Crie sua conta para gerenciar a frota'
            : 'Acesse sua conta para gerenciar a frota'}
        </p>

        <form
          onSubmit={isRegisterMode ? handleRegister : handleLogin}
          className="login-form"
        >
          {isRegisterMode && (
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                placeholder="Digite seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="form-group">
            <label>{isRegisterMode ? 'Email' : 'Usuário'}</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder={
                isRegisterMode
                  ? 'Mínimo 6 caracteres'
                  : 'Digite sua senha'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={isRegisterMode ? 6 : 1}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading
              ? 'Processando...'
              : isRegisterMode
              ? 'Cadastrar'
              : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="login-footer-text">
          <p>
            {isRegisterMode
              ? 'Já tem uma conta? '
              : 'Não tem uma conta? '}
            <button
              type="button"
              onClick={toggleMode}
              className="link-button"
              disabled={isLoading}
            >
              {isRegisterMode ? 'Faça login' : 'Cadastre-se'}
            </button>
          </p>
        </div>

        <p className="login-footer">LOCADORA DE VEÍCULOS CORPORATIVA V1.0</p>
      </div>
    </div>
  );
}
