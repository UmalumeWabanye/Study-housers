import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jpafninxpeeuvaqwfije.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwYWZuaW54cGVldXZhcXdmaWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyODcwODgsImV4cCI6MjA3Njg2MzA4OH0.EnU-g7bkVkYM17z6tE3lckaGS94k_QUucS71v1yB8Bk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Auth helpers ---------------------------------------------------------

/**
 * Sign in with Google using OAuth. For mobile apps you should provide a
 * deep-link/redirect URL via `redirectTo` that your app can handle.
 */
export async function signInWithGoogle(redirectTo?: string) {
	try {
		const options = redirectTo ? { redirectTo } : undefined
		const res = await supabase.auth.signInWithOAuth({ provider: 'google', options })
		return res
	} catch (error) {
		return { data: null, error }
	}
}

/**
 * Request an OTP be sent to a phone number (SMS).
 * Returns the Supabase response which typically contains user/session data or
 * instructions depending on project configuration.
 */
export async function requestPhoneOtp(phone: string) {
	try {
		const res = await supabase.auth.signInWithOtp({ phone })
		return res
	} catch (error) {
		return { data: null, error }
	}
}

/**
 * Verify an OTP code that was sent to a phone number. Use type 'sms'.
 * On success Supabase will return the user/session.
 */
export async function verifyPhoneOtp(phone: string, token: string) {
	try {
		const res = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })
		return res
	} catch (error) {
		return { data: null, error }
	}
}

/**
 * Request an OTP be sent to an email address (magic link / code) — useful
 * when a user prefers email delivery.
 */
export async function requestEmailOtp(email: string, redirectTo?: string) {
	try {
		// Pass redirectTo so Supabase will include it in the magic link.
	const payload: any = { email }
	if (redirectTo) payload.options = { emailRedirectTo: redirectTo, redirectTo }
	const res = await supabase.auth.signInWithOtp(payload)
		return res
	} catch (error) {
		return { data: null, error }
	}
}

/**
 * Verify an OTP code that was sent to an email address. Use type 'email'.
 */
export async function verifyEmailOtp(email: string, token: string) {
	try {
		const res = await supabase.auth.verifyOtp({ email, token, type: 'email' })
		return res
	} catch (error) {
		return { data: null, error }
	}
}

export async function signOut() {
	return supabase.auth.signOut()
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
	return supabase.auth.onAuthStateChange((event, session) => callback(event, session))
}

export async function getUser() {
	const { data, error } = await supabase.auth.getUser()
	return { data, error }
}

