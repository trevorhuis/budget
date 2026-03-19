import * as Headless from '@headlessui/react'
import React, { forwardRef } from 'react'
import { Link as TanstackLink } from '@tanstack/react-router'

export const Link = forwardRef(function Link(
  props: { href: string } & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  return (
    <Headless.DataInteractive>
      <TanstackLink to={props.href} {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})
