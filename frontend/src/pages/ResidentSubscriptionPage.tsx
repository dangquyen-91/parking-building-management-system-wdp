import { useState } from 'react'
import { ResidentSubscriptionForm } from '../components/subscription/ResidentSubscriptionForm'
import { ResidentSubscriptionPaymentStep } from '../components/subscription/ResidentSubscriptionPaymentStep'
import { ResidentSubscriptionSlotSection } from '../components/subscription/ResidentSubscriptionSlotSection'
import { ResidentSubscriptionTopNav } from '../components/subscription/ResidentSubscriptionTopNav'
import { SubscriptionStepHeader, type SubscriptionStep } from '../components/subscription/SubscriptionStepHeader'
import { SubscriptionWizardActions } from '../components/subscription/SubscriptionWizardActions'
import { useResidentSubscription } from '../hooks/useResidentSubscription'
import { normalizePlate } from '../utils/subscriptionUi'

export function ResidentSubscriptionPage() {
  const [step, setStep] = useState<SubscriptionStep>(1)
  const {
    vehicleType,
    plans,
    selectedPlanId,
    setSelectedPlanId,
    licensePlate,
    setLicensePlate,
    selectedSlotId,
    setSelectedSlotId,
    payment,
    isLoading,
    isSubmitting,
    error,
    message,
    selectedPlan,
    carFloors,
    motorcycleAvailability,
    canSubmit,
    handleVehicleTypeChange,
    handlePurchase,
  } = useResidentSubscription()

  const canGoStep2 = Boolean(selectedPlanId) && normalizePlate(licensePlate).length >= 4
  const canGoStep3 = vehicleType === 'motorcycle' || Boolean(selectedSlotId)

  function handleVehicleChange(value: typeof vehicleType) {
    handleVehicleTypeChange(value)
    setStep(1)
  }

  async function handleCreatePayment() {
    await handlePurchase()
  }

  return (
    <div className="min-h-screen bg-page text-fg">
      <ResidentSubscriptionTopNav />
      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 pb-4 pt-24 md:px-8 md:pb-8 lg:px-10 lg:pb-10">
        <SubscriptionStepHeader
          step={step}
          canGoStep2={canGoStep2}
          canGoStep3={canGoStep3}
          onStepChange={setStep}
        />

        {message && <div className="mb-5 rounded-lg border border-theme bg-badge p-4 text-sm text-fg">{message}</div>}
        {error && (
          <div className="mb-5 rounded-lg border border-theme bg-badge p-4 text-sm text-rose-700 dark:text-rose-100">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">
            Đang tải dữ liệu gói cư dân...
          </div>
        ) : (
          <div className="grid w-full gap-5">
            {step === 1 && (
              <>
                <ResidentSubscriptionForm
                  vehicleType={vehicleType}
                  plans={plans}
                  selectedPlanId={selectedPlanId}
                  selectedPlan={selectedPlan}
                  licensePlate={licensePlate}
                  onVehicleTypeChange={handleVehicleChange}
                  onPlanChange={setSelectedPlanId}
                  onLicensePlateChange={setLicensePlate}
                />

                <SubscriptionWizardActions
                  nextLabel="Tiếp tục chọn slot"
                  canNext={canGoStep2}
                  onNext={() => setStep(2)}
                />
              </>
            )}

            {step === 2 && (
              <>
                <ResidentSubscriptionSlotSection
                  vehicleType={vehicleType}
                  carFloors={carFloors}
                  motorcycleAvailability={motorcycleAvailability}
                  selectedSlotId={selectedSlotId}
                  onSlotChange={setSelectedSlotId}
                />

                <SubscriptionWizardActions
                  previousLabel="Quay lại chọn gói"
                  nextLabel="Tiếp tục thanh toán"
                  canNext={canGoStep3}
                  onPrevious={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              </>
            )}

            {step === 3 && (
              <ResidentSubscriptionPaymentStep
                vehicleType={vehicleType}
                selectedPlan={selectedPlan}
                licensePlate={licensePlate}
                selectedSlotId={selectedSlotId}
                carFloors={carFloors}
                motorcycleAvailability={motorcycleAvailability}
                payment={payment}
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                onCreatePayment={handleCreatePayment}
                onPrevious={() => setStep(2)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
