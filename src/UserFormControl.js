import React from "react"
import FieldMode from "./FieldMode";
import FormLayout from "./FormLayout";


const UserFormControl = props => {

    const {control, changeControl} = props;

    //console.log("RENDER UserFormControl", { control, changeControl })

    return (
        <div className="form-inline">
            <label>
                mode
                <select
                    className="form-control mr-sm-2"
                    value={control.mode}
                    onChange={ev => changeControl("mode", ev.target.value)}
                >
                    <option>{FieldMode.NORMAL}</option>
                    <option>{FieldMode.DISABLED}</option>
                    <option>{FieldMode.READ_ONLY}</option>
                    <option>{FieldMode.PLAIN_TEXT}</option>
                </select>
            </label>
            <label>
                labelColumnClass
                <input
                    type="text"
                    className="form-control mr-sm-2"
                    value={control.labelColumnClass}
                    onChange={ev => changeControl("labelColumnClass", ev.target.value)}
                >
                </input>
            </label>
            <label>
                wrapperColumnClass
                <input
                    type="text"
                    className="form-control mr-sm-2"
                    value={control.wrapperColumnClass}
                    onChange={ev => changeControl("wrapperColumnClass", ev.target.value)}
                >
                </input>
            </label>
            <label>
                currency
                <input
                    type="text"
                    className="form-control mr-sm-2"
                    value={control.currency}
                    onChange={ev => changeControl("currency", ev.target.value)}
                >
                </input>
            </label>
            <div className="form-check mr-sm-2">
                <input className="form-check-input" type="checkbox" id="inlineFormCheck2"
                       checked={control.currencyAddonRight}
                       onChange={ev => changeControl("currencyAddonRight", !control.currencyAddonRight)}
                />
                <label className="form-check-label" htmlFor="inlineFormCheck2">
                    currency right?
                </label>
            </div>
            <div className="form-check mr-sm-2">
                <div className="form-check">
                    <input
                        className="form-check-input mr-1"
                        type="radio"
                        name="formLayout"
                        id="formLayoutDefault"
                        value={FormLayout.DEFAULT}
                        checked={control.layout === FormLayout.DEFAULT}
                        onChange={ev => changeControl("layout", FormLayout.DEFAULT)}
                    />
                    <label className="form-check-label" htmlFor="formLayoutDefault">
                        DEFAULT
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input mr-1"
                        type="radio"
                        name="formLayout"
                        id="formLayoutHorizontal"
                        value={FormLayout.HORIZONTAL}
                        checked={control.layout === FormLayout.HORIZONTAL}
                        onChange={ev => changeControl("layout", FormLayout.HORIZONTAL)}
                    />
                    <label className="form-check-label" htmlFor="formLayoutHorizontal">
                        HORIZONTAL
                    </label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input  mr-1"
                        type="radio"
                        name="formLayout"
                        id="formLayoutInline"
                        value={FormLayout.INLINE}
                        checked={control.layout === FormLayout.INLINE}
                        onChange={ev => changeControl("layout", FormLayout.INLINE)}
                    />
                    <label className="form-check-label" htmlFor="formLayoutInline">
                        INLINE
                    </label>
                </div>
            </div>
        </div>
    )
};

export default UserFormControl
