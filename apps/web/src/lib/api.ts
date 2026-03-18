export const GET = async <TResponse>(url: string): Promise<TResponse> => {
    const response = await fetch(url)
    return response.json() as Promise<TResponse>
}

export const POST = async <TBody extends object>(url: string, body: TBody) => {
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
    })
}

export const PUT = async <TBody extends object>(url: string, body: TBody) => {
    await fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body)
    })
}

export const DELETE = async (url: string) => {
    await fetch(url, { method: 'DELETE' })
}
