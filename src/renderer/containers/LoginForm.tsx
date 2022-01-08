/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import styled from "@emotion/styled";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import type firebase from "firebase";
import React from "react";
import create from "zustand";
import { combine } from "zustand/middleware";

import { login, resetPassword, signUp } from "@/lib/firebase";
import { useAsync } from "@/lib/hooks/useAsync";

import { QuickStartHeader } from "./QuickStart/QuickStartHeader";

// Store this data in a hook so we can avoid dealing with setting state on unmount errors
const useLoginStore = create(
  combine(
    {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
    (set) => ({
      setEmail: (email: string) => set({ email }),
      setDisplayName: (displayName: string) => set({ displayName }),
      setPassword: (password: string) => set({ password }),
      setConfirmPassword: (confirmPassword: string) => set({ confirmPassword }),
    }),
  ),
);

const useStyles = makeStyles(() => ({
  cssLabel: {
    color: "#dddddd",
    "&.Mui-focused": {
      color: "#ffffff",
    },
  },
}));

export interface LoginFormProps {
  className?: string;
  disableAutoFocus?: boolean;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ className, onSuccess, disableAutoFocus }) => {
  const email = useLoginStore((store) => store.email);
  const setEmail = useLoginStore((store) => store.setEmail);
  const displayName = useLoginStore((store) => store.displayName);
  const setDisplayName = useLoginStore((store) => store.setDisplayName);
  const password = useLoginStore((store) => store.password);
  const setPassword = useLoginStore((store) => store.setPassword);
  const confirmPassword = useLoginStore((store) => store.confirmPassword);
  const setConfirmPassword = useLoginStore((store) => store.setConfirmPassword);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showPasswordResetForm, setShowPasswordResetForm] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const toggleSignUp = () => setIsSignUp(!isSignUp);
  const classes = useStyles();

  const { execute, loading, error, clearError } = useAsync(async () => {
    let user: firebase.auth.UserCredential;
    if (isSignUp) {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      user = await signUp(email.trim(), displayName, password);
    } else {
      user = await login(email.trim(), password);
    }
    if (user) {
      // Clear the form
      setEmail("");
      setDisplayName("");
      setPassword("");
      setConfirmPassword("");

      if (onSuccess) {
        onSuccess();
      }
    }
  });

  // Reset the error state when changing form type
  React.useEffect(() => {
    clearError();
  }, [showPasswordResetForm, isSignUp, clearError]);

  if (showPasswordResetForm) {
    return <ForgotPasswordForm onClose={() => setShowPasswordResetForm(false)} />;
  }

  return (
    <div className={className}>
      <QuickStartHeader>{isSignUp ? "Create an account" : "Log in"}</QuickStartHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void execute();
        }}
      >
        <div
          css={css`
            display: grid;
            grid-template-columns: 100%;
            grid-gap: 15px;
          `}
        >
          {isSignUp && (
            <TextField
              disabled={loading}
              label="Display Name"
              variant="filled"
              value={displayName}
              autoFocus={!disableAutoFocus}
              fullWidth={true}
              required={true}
              onChange={(e) => setDisplayName(e.target.value)}
              InputLabelProps={{
                classes: {
                  root: classes.cssLabel,
                },
              }}
            />
          )}
          <TextField
            disabled={loading}
            label="Email"
            variant="filled"
            value={email}
            autoFocus={!disableAutoFocus}
            fullWidth={true}
            required={true}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{
              classes: {
                root: classes.cssLabel,
              },
            }}
          />
          <TextField
            disabled={loading}
            variant="filled"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={!isSignUp && showPassword ? "text" : "password"}
            fullWidth={true}
            required={true}
            InputLabelProps={{
              classes: {
                root: classes.cssLabel,
              },
            }}
            InputProps={{
              endAdornment: !isSignUp ? (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ) : undefined,
            }}
          />
          {isSignUp && (
            <TextField
              disabled={loading}
              variant="filled"
              label="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={"password"}
              fullWidth={true}
              required={true}
              InputLabelProps={{
                classes: {
                  root: classes.cssLabel,
                },
              }}
            />
          )}
        </div>
        {error && <ErrorMessage>{error.message}</ErrorMessage>}
        <div
          css={css`
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            margin-bottom: 10px;
          `}
        >
          <Button
            color="secondary"
            onClick={toggleSignUp}
            size="small"
            css={css`
              text-transform: initial;
              font-size: 14px;
            `}
          >
            {isSignUp ? "I already have an account" : "Create an account"}
          </Button>
          <Button type="submit" color="primary" disabled={loading} variant="contained">
            {isSignUp ? "Sign up" : "Log in"}
          </Button>
        </div>
        {!isSignUp && (
          <div
            css={css`
              text-align: right;
            `}
          >
            <Button
              color="secondary"
              onClick={() => setShowPasswordResetForm(true)}
              size="small"
              css={css`
                text-transform: initial;
                font-size: 12px;
              `}
            >
              Forgot your password?
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

const ForgotPasswordForm: React.FC<{
  className?: string;
  onClose: () => void;
}> = ({ className, onClose }) => {
  const email = useLoginStore((store) => store.email);
  const setEmail = useLoginStore((store) => store.setEmail);
  const [success, setSuccess] = React.useState(false);
  const classes = useStyles();

  const { execute, loading, error } = useAsync(async () => {
    setSuccess(false);
    await resetPassword(email);
    setSuccess(true);
  });

  return (
    <div className={className}>
      <QuickStartHeader>Password Reset</QuickStartHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (success) {
            onClose();
          } else {
            void execute();
          }
        }}
      >
        {success ? (
          <div>Password reset instructions have been sent to {email}.</div>
        ) : (
          <TextField
            disabled={loading}
            label="Email"
            variant="filled"
            value={email}
            autoFocus={false}
            fullWidth={true}
            required={true}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{
              classes: {
                root: classes.cssLabel,
              },
            }}
          />
        )}
        {error && <ErrorMessage>{error.message}</ErrorMessage>}
        <div
          css={css`
            display: flex;
            justify-content: flex-end;
            align-items: center;
            margin-top: 20px;
            margin-bottom: 10px;
          `}
        >
          <Button type="submit" color="primary" disabled={loading} variant="contained">
            {success ? "Continue" : "Reset"}
          </Button>
        </div>
        {!success && (
          <div
            css={css`
              text-align: right;
            `}
          >
            <Button
              color="secondary"
              onClick={onClose}
              size="small"
              css={css`
                text-transform: initial;
                font-size: 12px;
              `}
            >
              Go back
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

const ErrorMessage = styled.div`
  margin-top: 10px;
  color: ${({ theme }) => theme.palette.error.main};
  font-size: 14px;
`;
