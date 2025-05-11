const fetch = require('node-fetch');

class CloudflareKV {
    constructor() {
        console.log('Environment variables check:', {
            hasAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
            hasNamespaceId: !!process.env.CLOUDFLARE_KV_NAMESPACE_ID,
            hasApiToken: !!process.env.CLOUDFLARE_API_TOKEN,
            accountIdLength: process.env.CLOUDFLARE_ACCOUNT_ID?.length,
            namespaceIdLength: process.env.CLOUDFLARE_KV_NAMESPACE_ID?.length,
            tokenLength: process.env.CLOUDFLARE_API_TOKEN?.length
        });

        this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        this.namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
        this.apiToken = process.env.CLOUDFLARE_API_TOKEN;
        
        if (!this.accountId || !this.namespaceId || !this.apiToken) {
            console.error('Missing variables:', {
                accountId: !this.accountId,
                namespaceId: !this.namespaceId,
                apiToken: !this.apiToken
            });
            throw new Error('Missing required environment variables. Please check your .env file.');
        }
        
        this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.namespaceId}`;
    }

    async listKeys() {
        try {
            console.log('Fetching from URL:', this.baseUrl);
            const response = await fetch(`${this.baseUrl}/keys`, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ errors: [{ message: response.statusText }] }));
                console.error('Response error:', errorData);
                throw new Error(errorData.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const keys = data.result || [];
            
            // Fetch values for all keys
            const items = await Promise.all(
                keys.map(async (item) => {
                    const value = await this.getValue(item.name);
                    return {
                        key: item.name,
                        value: value
                    };
                })
            );

            return items;
        } catch (error) {
            console.error('List keys error:', error);
            throw error;
        }
    }

    async getValue(key) {
        try {
            const response = await fetch(`${this.baseUrl}/values/${key}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                const errorData = await response.json().catch(() => ({ errors: [{ message: response.statusText }] }));
                throw new Error(errorData.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            console.error('Get value error:', error);
            throw error;
        }
    }

    async putValue(key, value) {
        try {
            const response = await fetch(`${this.baseUrl}/values/${key}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'text/plain',
                },
                body: value,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ errors: [{ message: response.statusText }] }));
                throw new Error(errorData.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Put value error:', error);
            throw error;
        }
    }

    async deleteValue(key) {
        try {
            const response = await fetch(`${this.baseUrl}/values/${key}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ errors: [{ message: response.statusText }] }));
                throw new Error(errorData.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Delete value error:', error);
            throw error;
        }
    }
}

module.exports = new CloudflareKV(); 