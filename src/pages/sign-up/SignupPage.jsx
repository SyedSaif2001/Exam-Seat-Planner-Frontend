import React from "react";
import Container from "../../components/shared/container/Container";
import InputText from "../../components/shared/input-fields/input-text-field/InputTextField";
import InputPasswordField from "../../components/shared/input-fields/input-password-field/InputPasswordField";

const SignupPage = () => {
  return (
    <div className="w-full flex justify-center">
      <Container className="py-[35px] px-[30px]">
        <div className="flex flex-col gap-4">
          <InputText label="CMS ID" placeholder="Enter your cms id" />
          <InputText label="Email Address" placeholder="Enter your email" />
          <InputPasswordField
            label="Password"
            placeholder="Enter your password"
          />
          <InputPasswordField
            label="Confirm Password"
            placeholder="Confirm your password"
          />
          <button className="bg-blue-500 text-white py-2 rounded-lg w-full">
            Sign In
          </button>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <p className="">Don't have an account?</p>
          <a href="#" className="text-blue-500 underline underline-offset-2">
            Sign up
          </a>
        </div>
      </Container>
    </div>
  );
};

export default SignupPage;
