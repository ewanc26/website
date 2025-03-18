export const load = ({ parent, params }) => {
    return parent().then(parentData => {
        return {
            ...parentData,
            rkey: params.rkey
        };
    });
}