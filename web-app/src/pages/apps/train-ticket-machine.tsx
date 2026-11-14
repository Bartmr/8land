import React from 'react';
import { TrainTicketMachineTemplate } from '../../page-components/apps/train-ticket-machine/train-ticket-machine';
import { HtmlHead } from '../../page-components/html-head/html-head';
import type { PageProps } from 'gatsby';

export default TrainTicketMachineTemplate;

export function Head({ location }: PageProps) {
  return <HtmlHead location={location} title="Train Ticket Machine" />;
}
