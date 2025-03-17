import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-200 to-gray-500 p-6">
            <div className="flex flex-col gap-5 items-center justify-center w-full max-w-[500px]">
                <img src="/assets/esp-Logo.png" alt="logo" className="h-[120px] w-[200px]" />
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;