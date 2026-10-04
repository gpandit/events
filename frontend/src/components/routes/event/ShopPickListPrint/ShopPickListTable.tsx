import React from "react";
import {t} from "@lingui/macro";
import {ShopPickListRow} from "../../../../types.ts";
import classes from "./ShopPickListTable.module.scss";

interface ShopPickListTableProps {
    rows: ShopPickListRow[];
    renderSelect?: (row: ShopPickListRow) => React.ReactNode;
    renderSelectAll?: () => React.ReactNode;
}

export const ShopPickListTable = ({rows, renderSelect, renderSelectAll}: ShopPickListTableProps) => {
    const hasSelection = !!renderSelect;

    return (
        <table className={classes.table}>
            <thead>
            <tr>
                <th className={classes.selectCell}>{hasSelection ? renderSelectAll?.() : null}</th>
                <th>{t`Student`}</th>
                <th>{t`Items`}</th>
                <th>{t`Order`}</th>
                <th>{t`Buyer`}</th>
            </tr>
            </thead>
            <tbody>
            {rows.map((row) => (
                <tr key={row.order_id} data-testid="pick-list-row">
                    <td className={classes.selectCell}>
                        {hasSelection ? renderSelect(row) : <span className={classes.tickBox}/>}
                    </td>
                    <td>
                        <strong>{row.student_name}</strong>
                        {row.answers.slice(1).map((answer) => (
                            <div key={answer.title} className={classes.detail}>{answer.title}: {answer.answer}</div>
                        ))}
                    </td>
                    <td>
                        {row.items.map((item, index) => (
                            <div key={index}>{item.quantity} x {item.name}</div>
                        ))}
                    </td>
                    <td>{row.order_public_id}</td>
                    <td>
                        {row.buyer_name}
                        <div className={classes.detail}>{row.buyer_email}</div>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};
