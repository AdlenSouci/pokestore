export class UpdateProfileDto {
    name?: string;
    phone?: string;
}

export class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export class SetPasswordDto {
    newPassword: string;
}
