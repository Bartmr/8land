import React from 'react';
import { TrainTicketMachineTemplate } from '../../pages-impl/apps/train-ticket-machine.tsx/train-ticket-machine';
import { HtmlHead } from '../../pages-impl/html-head/html-head';
import type { PageProps } from 'gatsby';

export default TrainTicketMachineTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Train Ticket Machine" />;
}
