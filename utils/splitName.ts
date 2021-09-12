export const splitName = (name: string) => {
    const firstName = name.split(' ').slice(0, -1).join(' ')
    const lastName = name.split(' ').slice(-1).join(' ')

    return { firstName, lastName }
}