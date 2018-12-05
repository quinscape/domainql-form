import React from "react"
import FieldMode from "./FieldMode";

export function withUserControl(Component)
{
    return class extends React.Component
    {
        state = {
            control: {
                horizontal: true,
                labelColumnClass: "col-md-3",
                wrapperColumnClass: "col-md-9",
                mode: FieldMode.NORMAL,
                currency: "EUR",
                currencyAddonRight: true
            },
        };

        changeControl = (name, value) => this.setState(
            {
                control: {
                    ... this.state.control,
                    [name] : value
                }
            }
        );

        render()
        {
            const { control } = this.state;

            return (
                <React.Fragment>
                    <UserFormControl
                        control={ control }
                        changeControl={ this.changeControl }
                    />
                    <hr/>
                    <Component
                        control={ control }
                        {... this.props}
                    />
                </React.Fragment>
            )
        }
    }
}


class UserFormControl extends React.Component {

    render()
    {
        const { control, changeControl } = this.props;

        //console.log("RENDER UserFormControl", { control, changeControl })

        return (
            <div className="form-inline">
                <label>
                    mode
                    <select
                        className="form-control mr-sm-2"
                        value={ control.mode }
                        onChange={ ev => changeControl("mode", ev.target.value)}
                    >
                        <option>{ FieldMode.NORMAL }</option>
                        <option>{ FieldMode.DISABLED }</option>
                        <option>{ FieldMode.READ_ONLY }</option>
                    </select>
                </label>
                <label>
                    labelColumnClass
                    <input
                        type="text"
                        className="form-control mr-sm-2"
                        value={ control.labelColumnClass }
                        onChange={ ev => changeControl("labelColumnClass", ev.target.value)}
                    >
                    </input>
                </label>
                <label>
                    wrapperColumnClass
                    <input
                        type="text"
                        className="form-control mr-sm-2"
                        value={ control.wrapperColumnClass }
                        onChange={ ev => changeControl("wrapperColumnClass", ev.target.value)}
                    >
                    </input>
                </label>
                <label>
                    currency
                    <input
                        type="text"
                        className="form-control mr-sm-2"
                        value={ control.currency}
                        onChange={ ev => changeControl("currency", ev.target.value)}
                    >
                    </input>
                </label>
                <div className="form-check mr-sm-2">
                    <input className="form-check-input" type="checkbox" id="inlineFormCheck2"
                           checked={ control.currencyAddonRight }
                           onChange={ ev => changeControl("currencyAddonRight", !control.currencyAddonRight)}
                    />
                    <label className="form-check-label" htmlFor="inlineFormCheck2">
                        currency right?
                    </label>
                </div>
                <div className="form-check mr-sm-2">
                    <input className="form-check-input" type="checkbox" id="inlineFormCheck"
                           checked={ control.horizontal }
                           onChange={ ev => changeControl("horizontal", !control.horizontal)}
                    />
                    <label className="form-check-label" htmlFor="inlineFormCheck">
                        horizontal
                    </label>
                </div>

            </div>
        )
    }
}

export default UserFormControl
