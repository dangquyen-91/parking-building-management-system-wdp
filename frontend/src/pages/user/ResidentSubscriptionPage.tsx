import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import {
  ResidentSubscriptionForm,
  ResidentSubscriptionPaymentStep,
  ResidentSubscriptionSlotSection,
  ResidentSubscriptionTopNav,
  SubscriptionStepHeader,
  SubscriptionWizardActions,
  type SubscriptionStep,
} from '../../components/subscription'
import { useResidentSubscription } from '../../hooks/useResidentSubscription'
import type { VehicleType } from '../../services/userSubscriptionApi'
import { normalizePlate } from '../../utils/subscriptionUi'

function getVehicleTypeFromParam(value: string | null): VehicleType | undefined {
  return value === 'motorcycle' || value === 'car' ? value : undefined
}

type ResidentSubscriptionPurchaseFlowProps = {
  initialPlanId: string
  initialVehicleType: VehicleType
}

function ResidentSubscriptionPurchaseFlow({
  initialPlanId,
  initialVehicleType,
}: ResidentSubscriptionPurchaseFlowProps) {
  const [step, setStep] = useState<SubscriptionStep>(1)
  const {
    vehicleType,
    licensePlate,
    setLicensePlate,
    eligibleVehicles,
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
  } = useResidentSubscription({
    initialPlanId,
    initialVehicleType,
  })

  const canGoStep2 = normalizePlate(licensePlate).length >= 4
  const canGoStep3 = Boolean(selectedPlan)
  const canGoStep4 = vehicleType === 'motorcycle' || Boolean(selectedSlotId)
  const slotStepNumber = 2
  const paymentStepNumber = vehicleType === 'motorcycle' ? 2 : 3

  function handleVehicleChange(value: typeof vehicleType) {
    handleVehicleTypeChange(value)
    setStep(1)
  }

  async function handleCreatePayment() {
    await handlePurchase()
  }

  function getNextStepAfterVehicleInfo() {
    return vehicleType === 'motorcycle' ? 4 : 3
  }

  function handleStepChange(nextStep: SubscriptionStep) {
    if (nextStep === 2) {
      setStep(getNextStepAfterVehicleInfo())
      return
    }

    if (nextStep === 3 && vehicleType === 'motorcycle') return
    setStep(nextStep)
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
          onStepChange={handleStepChange}
          hidePlanStep
          hideSlotStep={vehicleType === 'motorcycle'}
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
                  registeredVehicles={eligibleVehicles}
                  lockedVehicleType
                  selectedPlanName={selectedPlan?.name}
                />

                <SubscriptionWizardActions
                  nextLabel={vehicleType === 'motorcycle' ? 'Tiếp tục thanh toán' : 'Tiếp tục chọn vị trí'}
                  canNext={canGoStep2}
                  onNext={() => setStep(getNextStepAfterVehicleInfo())}
                />
              </>
            )}

            {step === 3 && vehicleType === 'car' && (
              <>
                <ResidentSubscriptionSlotSection
                  vehicleType={vehicleType}
                  carFloors={carFloors}
                  motorcycleAvailability={motorcycleAvailability}
                  selectedSlotId={selectedSlotId}
                  onSlotChange={setSelectedSlotId}
                  stepNumber={slotStepNumber}
                />

                <SubscriptionWizardActions
                  previousLabel="Quay lại chọn biển số"
                  nextLabel="Tiếp tục thanh toán"
                  canNext={canGoStep4}
                  onPrevious={() => setStep(1)}
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
                onPrevious={() => setStep(vehicleType === 'motorcycle' ? 1 : 3)}
                stepNumber={paymentStepNumber}
                previousLabel={vehicleType === 'motorcycle' ? 'Quay lại chọn biển số' : 'Quay lại chọn vị trí'}
              />
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export function ResidentSubscriptionPage() {
  const [searchParams] = useSearchParams()
  const initialPlanId = searchParams.get('planId')
  const initialVehicleType = getVehicleTypeFromParam(searchParams.get('vehicleType'))

  if (!initialPlanId || !initialVehicleType) {
    return <Navigate to="/#resident-plans" replace />
  }

  return (
    <ResidentSubscriptionPurchaseFlow
      initialPlanId={initialPlanId}
      initialVehicleType={initialVehicleType}
    />
  )
}
