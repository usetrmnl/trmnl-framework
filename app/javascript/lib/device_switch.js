// Device switching from the command palette and the device dropdown. Both build a
// throwaway form and hand it here.
//
// The overlay this used to raise belongs to the mother app: no template in this repo
// renders one, so the whole transition-loading path fell through to a plain submit on
// every switch. Submitting is the behavior.

export function isCurrentDeviceSwitch(deviceId, currentDeviceId) {
  return Boolean(deviceId && currentDeviceId && String(deviceId) === String(currentDeviceId))
}

export function submitDeviceSwitchForm(form, options = {}) {
  if (isCurrentDeviceSwitch(options.deviceId, options.currentDeviceId)) {
    form?.remove?.()
    return false
  }

  form?.submit?.()

  return true
}
