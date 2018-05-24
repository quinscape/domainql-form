import sinon from "sinon";
import assert from "power-assert";

/**
 * Jsdom helper to answer a HTML confirm dialog positively
 *
 * @param fn  code to execute with the confirm overload
 */
export default function (fn) {

    const confirmSpy = sinon.spy();
    global.confirm = () => {
        confirmSpy();
        return true
    };
    fn();
    delete global.confirm;
    assert(confirmSpy.called);

}
