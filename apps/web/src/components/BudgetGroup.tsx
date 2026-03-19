
type Props = {
    title: string
}

export const BudgetGroup = (props: Props) => {
    return (
        <div className="p-8">
            <h2>{props.title}</h2>
        </div>
    )
}