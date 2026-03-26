import { SetMetadata } from '@nestjs/common';

export const ADMIN_ONLY_METADATA_KEY = 'admin_only';
export const AdminOnly = () => SetMetadata(ADMIN_ONLY_METADATA_KEY, true);
