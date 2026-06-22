import { useState } from 'react'
import {
  ResidentSubscriptionForm,
  ResidentSubscriptionPaymentStep,
  ResidentSubscriptionPlanSection,
  ResidentSubscriptionSlotSection,
  ResidentSubscriptionTopNav,
  SubscriptionStepHeader,
  SubscriptionWizardActions,
  type SubscriptionStep,
} from '../../components/subscription'
import { useResidentSubscription } from '../../hooks/useResidentSubscription'
import { normalizePlate } from '../../utils/subscriptionUi'

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
    createdSubscription,
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

  const canGoStep2 = normalizePlate(licensePlate).length >= 4
  const canGoStep3 = Boolean(selectedPlanId)
  const canGoStep4 = vehicleType === 'motorcycle' || Boolean(selectedSlotId)

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
      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 pb-8 pt-24 md:px-8 md:pb-10 lg:px-10">
        <SubscriptionStepHeader
          step={step}
          canGoStep2={canGoStep2}
          canGoStep3={canGoStep3}
          canGoStep4={canGoStep4}
          onStepChange={setStep}
        />

        {message && <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-fg">{message}</div>}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-100">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-xl border border-theme bg-badge p-5 text-sm text-muted">
            Đang tải dữ liệu gói cư dân...
          </div>
        ) : (
          <div className="grid w-full gap-5">
            {step === 1 && (
              <>
                <ResidentSubscriptionForm
                  vehicleType={vehicleType}
                  licensePlate={licensePlate}
                  onVehicleTypeChange={handleVehicleChange}
                  onLicensePlateChange={setLicensePlate}
                />

                <SubscriptionWizardActions
                  nextLabel="Tiếp tục chọn gói"
                  canNext={canGoStep2}
                  onNext={() => setStep(2)}
                />
              </>
            )}

            {step === 2 && (
              <>
                <ResidentSubscriptionPlanSection
                  vehicleType={vehicleType}
                  plans={plans}
                  selectedPlanId={selectedPlanId}
                  onPlanChange={setSelectedPlanId}
                />

                <SubscriptionWizardActions
                  previousLabel="Quay lại thông tin xe"
                  nextLabel="Tiếp tục chọn vị trí"
                  canNext={canGoStep3}
                  onPrevious={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              </>
            )}

            {step === 3 && (
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
                  canNext={canGoStep4}
                  onPrevious={() => setStep(2)}
                  onNext={() => setStep(4)}
                />
              </>
            )}

            {step === 4 && (
              <ResidentSubscriptionPaymentStep
                vehicleType={vehicleType}
                selectedPlan={selectedPlan}
                licensePlate={licensePlate}
                selectedSlotId={selectedSlotId}
                carFloors={carFloors}
                motorcycleAvailability={motorcycleAvailability}
                createdSubscription={createdSubscription}
                payment={payment}
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                onCreatePayment={handleCreatePayment}
                onPrevious={() => setStep(3)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
