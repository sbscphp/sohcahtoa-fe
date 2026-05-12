"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
// Import the modals here
import { ConfirmationModal, FundEscrowForm, SuccessModal } from "./FundEscrowFlow";

export default function FundEscrowPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const router = useRouter();

  const handleFormSubmit = () => {
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    
    // Simulate API Call duration
    setTimeout(() => {
      setSuccessOpen(true);
    }, 500);
  };

  // 3. Close/Navigate logic
  const handleCloseSuccess = () => {
    setSuccessOpen(false);
    router.push("/admin/settlement");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      
      {/* 1. The Main Form */}
      <FundEscrowForm onSubmit={handleFormSubmit} />

      {/* 2. The Confirmation Modal (Must be rendered here to work) */}
      <ConfirmationModal 
        opened={confirmOpen} 
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />

      {/* 3. The Success Modal (Must be rendered here to work) */}
      <SuccessModal 
        opened={successOpen} 
        onClose={handleCloseSuccess}
      />
    </div>
  );
}