import React from "react";
import Container from "../../components/shared/container/Container";
import InputText from "../../components/shared/input-fields/input-text-field/InputTextField";
import InputPasswordField from "../../components/shared/input-fields/input-password-field/InputPasswordField";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/");
  };
  return (
    <div className="w-full flex justify-center">
      <Container className="py-[35px] px-[30px]">
        <div className="flex flex-col gap-4">
          <InputText label="CMS ID" placeholder="Enter your cms id" />
          <InputPasswordField
            label="Password"
            placeholder="Enter your password"
          />
          <button onClick={handleLogin} className="bg-blue-500 text-white py-2 rounded-lg w-full">
            Sign In
          </button>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <p className="">Don't have an account?</p>
          <Link
            to="/sign-up"
            className="text-blue-500 underline underline-offset-2"
          >
            Sign up
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default LoginPage;
