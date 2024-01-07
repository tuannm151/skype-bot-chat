interface Group {
    id: string
    name: string
    is_group: boolean
    reference: object
    skype_id: string
}

interface DirectusSchema {
    msbot_group: Group[]
}

export {
    Group,
    DirectusSchema
};