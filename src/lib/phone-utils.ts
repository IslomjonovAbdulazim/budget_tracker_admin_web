export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('998')) {
    const withoutCountry = cleaned.slice(3)
    if (withoutCountry.length === 9) {
      return `+998 (${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 5)}-${withoutCountry.slice(5, 7)}-${withoutCountry.slice(7)}`
    }
  }
  
  return phone
}

export function formatPhoneForAPI(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('998')) {
    return `+${cleaned}`
  }
  
  if (cleaned.length === 9) {
    return `+998${cleaned}`
  }
  
  return `+998${cleaned}`
}

export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('998')) {
    return cleaned.length === 12
  }
  
  return cleaned.length === 9
}

export function formatPhoneInput(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  
  let withCountry = cleaned
  if (!cleaned.startsWith('998')) {
    withCountry = '998' + cleaned
  }
  
  const match = withCountry.match(/^(\d{3})(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/)
  if (match) {
    const formatted = [
      '+' + match[1],
      match[2] ? ` (${match[2]}` : '',
      match[3] ? `) ${match[3]}` : match[2] ? ')' : '',
      match[4] ? `-${match[4]}` : '',
      match[5] ? `-${match[5]}` : ''
    ].join('')
    
    return formatted
  }
  
  return value
}