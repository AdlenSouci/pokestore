const API_URL = 'http://localhost:3000';

export interface UpdateProfileData {
    name?: string;
    phone?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export const profileService = {
    async updateProfile(updateData: UpdateProfileData) {
        const token = localStorage.getItem('access_token');

        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
        }

        const updatedUser = await response.json();

        // Mettre à jour le localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const newUser = { ...currentUser, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(newUser));

        return updatedUser;
    },

    async changePassword(passwordData: ChangePasswordData) {
        const token = localStorage.getItem('access_token');

        const response = await fetch(`${API_URL}/auth/password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(passwordData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors du changement de mot de passe');
        }

        return await response.json();
    },

    async setPassword(newPassword: string) {
        const token = localStorage.getItem('access_token');

        const response = await fetch(`${API_URL}/auth/set-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ newPassword }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la définition du mot de passe');
        }

        return await response.json();
    },
};
