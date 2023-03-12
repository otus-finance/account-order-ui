import { ArrowRightCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { toast, ToastContentProps, ToastOptions, UpdateOptions } from 'react-toastify'
import { Spinner } from '../Components/Spinner'

export type ToastVariant = 'info' | 'success' | 'error' | 'warning'

type ToastRenderOptions = {
  variant?: ToastVariant
  icon: ToastIcon
  description?: React.ReactNode
  hrefLabel?: React.ReactNode
  href?: string
  target?: string
}

export type ToastProps = ToastContentProps & ToastRenderOptions
export type CreateToastOptions = ToastRenderOptions & Omit<ToastOptions, 'type'>
export type UpdateToastOptions = ToastRenderOptions & Omit<UpdateOptions, 'render'>

export function createToast(options: CreateToastOptions): string {
  const { icon, description, hrefLabel, href, target, variant, autoClose = false, ...toastOptions } = options;

  const toastId = toast(
    ({ toastProps, closeToast }) => (
      <Toast
        variant={variant}
        icon={icon}
        description={description}
        hrefLabel={hrefLabel}
        href={href}
        target={target}
        toastProps={toastProps}
        closeToast={closeToast}
      />
    ),
    {
      ...toastOptions,
      autoClose,
      closeOnClick: false,
      draggable: false,
      progressStyle: { background: 'rgba(255, 255, 255, 0.1)', height: '3.5px' },
      className: 'bg-zinc-800',
    }
  )

  return toastId as string;

}

export function createPendingToast(options: Omit<CreateToastOptions, 'variant'>): string {
  const { autoClose = false } = options
  return createToast({
    variant: 'info',
    autoClose,
    ...options,
  })
}

export function updatePendingToast(toastId: string, options: Omit<UpdateToastOptions, 'variant'>): void {
  updateToast(toastId, {
    variant: 'info',
    ...options,
  })
}

export function updateToast(toastId: string, options: UpdateToastOptions) {
  const { icon, description, href, target, variant, autoClose = false, ...updateOptions } = options
  if (toast.isActive(toastId)) {
    toast.update(toastId, {
      ...updateOptions,
      autoClose,
      progressStyle: { background: 'rgba(255, 255, 255, 0.1)', height: '3.5px' },
      draggable: false,
      closeOnClick: false,
      render: ({ toastProps, closeToast }) => (
        <Toast
          variant={variant}
          icon={icon}
          description={description}
          href={href}
          target={target}
          toastProps={toastProps}
          closeToast={closeToast}
        />
      ),
    })
  } else {
    createToast({ icon, description, href, target, variant, autoClose: autoClose ?? undefined })
  }
}

export function closeToast(toastId: string): void {
  toast.dismiss(toastId)
}

const getToastVariantKey = (variant: ToastVariant): string => {
  switch (variant) {
    case 'info':
      return 'toastDefault'
    case 'success':
      return 'toastSuccess'
    case 'error':
      return 'toastError'
    case 'warning':
      return 'toastWarning'
  }
}

export type ButtonVariant = 'default' | 'primary' | 'error' | 'light' | 'warning' | 'white' | 'static' | 'elevated'

const getButtonVariant = (variant: ToastVariant): ButtonVariant => {
  switch (variant) {
    case 'info':
      return 'default'
    case 'success':
      return 'primary'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
  }
}

export default function Toast({
  variant = 'info',
  description,
  hrefLabel,
  href,
  target,
  icon,
  closeToast,
}: ToastProps) {
  return (
    <div className='flex justify-between' onClick={() => {
      if (closeToast) {
        closeToast()
      }
    }}>


      <div className='text-sm text-zinc-200'>
        {
          description && <span>{description}</span>
        }
      </div>



      {
        href && <a href={href}>{hrefLabel}</a>
      }

      <div className='' onClick={e => {
        if (closeToast) {
          e.preventDefault()
          e.nativeEvent.stopPropagation()
          e.stopPropagation()
          closeToast()
        }
      }}>

        <ToastIcons icon={icon} />

      </div>

    </div>
  )
}

export enum ToastIcon {
  Success,
  Error,
  Pending,
  Confirm
}

const ToastIcons = ({ icon }: { icon: ToastIcon }) => {
  switch (icon) {
    case ToastIcon.Success:
      return <CheckCircleIcon className='text-white' />;
    case ToastIcon.Error:
      return <ExclamationTriangleIcon className='text-white' />;
    case ToastIcon.Pending:
      return <Spinner />;
    case ToastIcon.Confirm:
      return <ArrowRightCircleIcon className='text-white' />
    default:
      return <></>
  }
}