"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "user" // Default to regular user
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signUp } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await signUp(
      formData.email,
      formData.password,
      {
        name: formData.name,
        phone_number: formData.phone,
        role: formData.role
      }
    );

    if (signUpError) {
      setError(signUpError.message);
    } else {
      let successMessage = "Registration successful! Please check your email to verify your account.";
      if (formData.role === 'homeowner') {
        successMessage += " As a homeowner, you'll be able to submit properties for listing once your account is verified.";
      }
      setSuccess(successMessage);
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        role: "user"
      });
    }
    setLoading(false);
  };

  return (
    <div className="modal modal-account fade" id="modalRegister">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="flat-account">
            <div className="banner-account">
              <Image
                alt="banner"
                src="/images/banner/banner-account2.jpg"
                width={570}
                height={1263}
              />
            </div>
            <form onSubmit={handleSubmit} className="form-account">
              <div className="title-box">
                <h4>Create Account</h4>
                <span
                  className="close-modal icon-close2"
                  data-bs-dismiss="modal"
                />
              </div>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              <div className="box">
                <fieldset className="box-fieldset">
                  <label htmlFor="name">Full Name *</label>
                  <div className="ip-field">
                    <svg className="icon" width={18} height={18} viewBox="0 0 18 18" fill="none">
                      <path d="M13.4869 14.0435C12.9628 13.3497 12.2848 12.787 11.5063 12.3998C10.7277 12.0126 9.86989 11.8115 9.00038 11.8123C8.13086 11.8115 7.27304 12.0126 6.49449 12.3998C5.71594 12.787 5.03793 13.3497 4.51388 14.0435M13.4869 14.0435C14.5095 13.1339 15.2307 11.9349 15.5563 10.6056C15.8818 9.27625 15.7956 7.87934 15.309 6.60014C14.8224 5.32093 13.9584 4.21986 12.8317 3.44295C11.7049 2.66604 10.3686 2.25 9 2.25C7.63137 2.25 6.29508 2.66604 5.16833 3.44295C4.04158 4.21986 3.17762 5.32093 2.69103 6.60014C2.20443 7.87934 2.11819 9.27625 2.44374 10.6056C2.76929 11.9349 3.49125 13.1339 4.51388 14.0435M13.4869 14.0435C12.2524 15.1447 10.6546 15.7521 9.00038 15.7498C7.3459 15.7523 5.74855 15.1448 4.51388 14.0435M11.2504 7.31228C11.2504 7.90902 11.0133 8.48131 10.5914 8.90327C10.1694 9.32523 9.59711 9.56228 9.00038 9.56228C8.40364 9.56228 7.83134 9.32523 7.40939 8.90327C6.98743 8.48131 6.75038 7.90902 6.75038 7.31228C6.75038 6.71554 6.98743 6.14325 7.40939 5.72129C7.83134 5.29933 8.40364 5.06228 9.00038 5.06228C9.59711 5.06228 10.1694 5.29933 10.5914 5.72129C11.0133 6.14325 11.2504 6.71554 11.2504 7.31228Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </fieldset>
                
                <fieldset className="box-fieldset">
                  <label htmlFor="role">Account Type *</label>
                  <div className="ip-field">
                    <svg className="icon" width={18} height={18} viewBox="0 0 18 18" fill="none">
                      <path d="M9 9C10.1046 9 11 8.10457 11 7C11 5.89543 10.1046 5 9 5C7.89543 5 7 5.89543 7 7C7 8.10457 7.89543 9 9 9Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 15V13C15 11.8954 14.1046 11 13 11H5C3.89543 11 3 11.8954 3 13V15" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <select
                      name="role"
                      className="form-control"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="user">Property Browser (Looking to buy/rent)</option>
                      <option value="homeowner">Property Owner (Want to list property)</option>
                    </select>
                  </div>
                  <small className="text-muted">
                    {formData.role === 'homeowner' 
                      ? 'As a property owner, you can submit properties for listing on our platform.'
                      : 'Browse properties, save favorites, and contact property owners.'
                    }
                  </small>
                </fieldset>
                
                <fieldset className="box-fieldset">
                  <label htmlFor="email">Email *</label>
                  <div className="ip-field">
                    <svg className="icon" width={18} height={18} viewBox="0 0 18 18" fill="none">
                      <path d="M2.25 4.5H15.75C16.1642 4.5 16.5 4.83579 16.5 5.25V12.75C16.5 13.1642 16.1642 13.5 15.75 13.5H2.25C1.83579 13.5 1.5 13.1642 1.5 12.75V5.25C1.5 4.83579 1.83579 4.5 2.25 4.5Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="L1.5 5.25L9 10.125L16.5 5.25" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </fieldset>
                
                <fieldset className="box-fieldset">
                  <label htmlFor="phone">Phone (Optional)</label>
                  <div className="ip-field">
                    <svg className="icon" width={18} height={18} viewBox="0 0 18 18" fill="none">
                      <path d="M16.5 12.6V14.85C16.5008 15.0526 16.4562 15.2528 16.3694 15.4364C16.2826 15.6201 16.1556 15.7827 15.9968 15.9122C15.838 16.0416 15.6513 16.1348 15.4511 16.185C15.2509 16.2353 15.042 16.2416 14.8388 16.2037C12.5338 15.8487 10.3563 14.9712 8.50875 13.65C6.79125 12.4425 5.38 11.0313 4.1725 9.31375C2.8425 7.45875 1.965 5.27125 1.62 2.95875C1.582 2.75666 1.58825 2.54895 1.63825 2.3498C1.68825 2.15066 1.78075 1.96501 1.90875 1.80751C2.03675 1.65001 2.19825 1.52376 2.38075 1.43751C2.56325 1.35126 2.7625 1.30701 2.9625 1.30876H5.2125C5.55875 1.30576 5.89375 1.43001 6.15375 1.65751C6.41375 1.88501 6.57875 2.20126 6.6225 2.54626C6.7025 3.23626 6.855 3.91626 7.08 4.57501C7.17375 4.82501 7.19125 5.09751 7.1325 5.35876C7.07375 5.62001 6.9325 5.85876 6.7275 6.03751L5.74875 7.01626C6.87375 8.82376 8.47625 10.4263 10.2838 11.5513L11.2625 10.5725C11.4413 10.3675 11.68 10.2263 11.9413 10.1675C12.2025 10.1088 12.475 10.1263 12.725 10.22C13.3838 10.445 14.0638 10.5975 14.7538 10.6775C15.1038 10.7225 15.4238 10.8913 15.6513 11.1563C15.8788 11.4213 15.9988 11.7613 15.9913 12.1113L16.5 12.6Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </fieldset>
                
                <fieldset className="box-fieldset">
                  <label htmlFor="password">Password *</label>
                  <div className="ip-field">
                    <svg className="icon" width={18} height={18} viewBox="0 0 18 18" fill="none">
                      <path d="M12.375 7.875V5.0625C12.375 4.16739 12.0194 3.30895 11.3865 2.67601C10.7536 2.04308 9.89511 1.6875 9 1.6875C8.10489 1.6875 7.24645 2.04308 6.61351 2.67601C5.98058 3.30895 5.625 4.16739 5.625 5.0625V7.875M4.5 7.875H13.5C14.1213 7.875 14.625 8.37868 14.625 9V15C14.625 15.6213 14.1213 16.125 13.5 16.125H4.5C3.87868 16.125 3.375 15.6213 3.375 15V9C3.375 8.37868 3.87868 7.875 4.5 7.875Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </fieldset>
                
                <fieldset className="box-fieldset">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <div className="ip-field">
                    <svg className="icon" width={18} height={18} viewBox="0 0 18 18" fill="none">
                      <path d="M12.375 7.875V5.0625C12.375 4.16739 12.0194 3.30895 11.3865 2.67601C10.7536 2.04308 9.89511 1.6875 9 1.6875C8.10489 1.6875 7.24645 2.04308 6.61351 2.67601C5.98058 3.30895 5.625 4.16739 5.625 5.0625V7.875M4.5 7.875H13.5C14.1213 7.875 14.625 8.37868 14.625 9V15C14.625 15.6213 14.1213 16.125 13.5 16.125H4.5C3.87868 16.125 3.375 15.6213 3.375 15V9C3.375 8.37868 3.37868 7.875 4.5 7.875Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </fieldset>
              </div>
              <button 
                type="submit" 
                className="tf-btn primary w-100"
                disabled={loading}
              >
                {loading ? "Creating account..." : `Create ${formData.role === 'homeowner' ? 'Homeowner' : 'User'} Account`}
              </button>
              <div className="box-question">
                <p>Already have an account?</p>
                <Link href="#" data-bs-toggle="modal" data-bs-target="#modalLogin" data-bs-dismiss="modal">
                  Login here
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
