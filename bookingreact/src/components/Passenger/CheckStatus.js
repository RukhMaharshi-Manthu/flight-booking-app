import React, { Component } from 'react'
import { withRouter } from "react-router-dom";
import { Button, ButtonToolbar, Dropdown } from "react-bootstrap";
import jsPDF from "jspdf";
import Edit from './Edit';
import NewFlight from './NewFlight';

class CheckStatus extends Component {
    constructor(props) {
        super(props);

        this.state = {
            bookData: [{}],
            token: this.props.match.params.bookid,
            isForm: false,
            propName: "", updateValue: "SELECT VALUE",
            newValue: "",
            isEdit: false,
            flightData: [{}],
            source: "",
            destination: "",
            showlists: false,
            data: [],
            bookId: "",
            amount: 0
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.displayRazorpay = this.displayRazorpay.bind(this);
        this.intheEnd = this.intheEnd.bind(this);
    }

    // This function Updates the property of entity, Basically a submit function after filling update form 
    onSubmit() {
        const Post = [{
            propName: this.state.propName,
            value: this.state.newValue
        }]

        fetch("http://localhost:7002/bookings/" + this.state.bookId, {
            method: "PATCH",
            headers: {
                "content-type": "application/json",
                "Authorization": "Bearer " + this.state.tokenn
            },
            body: JSON.stringify(Post)
        })
            .then((dat) => {
                console.log(dat);
                if (this.state.propName === "amount" || this.state.propName === "status") {
                    return
                }
                else {
                    alert("Data Updated Successfully");
                    this.setState({ bookId: "", propName: "", newValue: "" });
                    window.location.reload();
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }



    //get all booked tickets booked before
    componentWillMount() {
        fetch("http://localhost:7002/bookings/get/status/" + this.state.token, {
            method: "GET"
        })
            .then((response) =>
                response.json().catch((err) => {
                    console.err(`'${err}' happened!`);
                    return {};
                })
            )
            .then((json) => {
                console.log(json);
                this.setState({ bookData: json });
            })
            .catch((err) => {
                console.log("fetch request failed: ", err);
            });


        fetch("http://localhost:7001/flights/")
            .then((response) =>
                response.json().catch((err) => {
                    console.err(`'${err}' happened!`);
                    return {};
                })
            )
            .then((json) => {
                console.log("parsed json: ", json);

                this.setState({ data: json });
            })
            .catch((err) => {
                console.log("fetch request failed: ", err);
            });
    }



    getsomething() {
        return (<div></div>);
    }


    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }







    downloadPDF = (fly) => {
        var flightArrival = "";
        var flightDeparture = "";
        fetch("http://localhost:7001/flights/" + fly.flightID)
            .then(doc => doc.json())
            .then((result) => {
                console.log(result[0].flightArrival);
                console.log(result[0].flightDeparture);
                // flightArrival = ;
                // flightDeparture = ;
                console.log(flightArrival);
                console.log(flightDeparture);

                var doc = new jsPDF('p', 'pt');
                doc.text([
                    `Booking ID: ${fly.bookId}`,
                    `Full Name: ${fly.firstname}  ${fly.lastname}`,
                    `Number: ${fly.number}  Nationality: ${fly.Nationality}`,
                    `Email: ${fly.email}`
                ], 50, 50);

                doc.text([`Flight Arrival Time:  ${result[0].flightArrival}`,
                `Flight Departure Time: ${result[0].flightDeparture}`, "Be On Time ",
                    "Happy Journey"], 50, 170);
                doc.setFont('courier');
                doc.text("Happy Journey from FLy Smart Family", 250, 250);
                doc.save("Ticket.pdf");
            })
    }



    intheEnd() {

        this.setState({ propName: "amount" })
        this.setState({ newValue: 0 })
        this.onSubmit();
    }

    afterinTheEnd() {
        this.setState({ propName: "status" })
        this.setState({ newValue: "CONFIRMED" })
        this.onSubmit();
    }

    loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = src
            script.onload = () => {
                resolve(true)
            }
            script.onerror = () => {
                resolve(false)
            }
            document.body.appendChild(script)
        })
    }


    async displayRazorpay(fly) {

        const __DEV__ = document.domain === 'localhost'

        const res = await this.loadScript('https://checkout.razorpay.com/v1/checkout.js')

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?')
            return
        }

        const data = await fetch('http://localhost:7003/pay/razorpay/' + fly.amount, { method: 'POST' })
            .then((t) => t.json())

        console.log(data)

        const options = {
            key: __DEV__ ? 'rzp_test_mTep58pZ2brlaL' : 'PRODUCTION_KEY',
            currency: 'INR',
            amount: fly.amount.toString(),
            order_id: data.id,
            name: 'Donation',
            description: 'Thank you for nothing. Please give us some money',
            // image: 'http://localhost:1337/logo.svg',
            handler: function (response) {
                if (paymentObject.id == 'error') {
                    alert('An Error has Occured ' + paymentObject.er)
                }
                else {

                    alert(`Payment has done sucessfully ${response.razorpay_order_id}`);
                    window.location.reload();
                }
                // alert(response.razorpay_payment_id)
                // alert(response.razorpay_order_id)
                // alert(response.razorpay_signature)
            },
            prefill: {
                name: fly.firstname,
                email: 'patil@mail.com',
                phone_number: '9899999999'
            }
        }

        const paymentObject = await new window.Razorpay(options)
        await paymentObject.open();
        this.setState({ bookId: fly.bookId });
        await this.intheEnd();
        await this.afterinTheEnd();

    }
    routeChange = (e) => {
        const a = prompt("This page will directly take u to the sign up page, If you are already a user log in to see status of your flights, ENTER 'CONFIRM' in input field..");
        if (a == 'CONFIRM') {
          let path = "/book/" + e.flightId + "/" + e.amount;
          
          this.props.history.push(path);
        } else {
          window.location.reload();
        }
      };

    render() {


        let path = "/flights";
        let isEditModalClose = () => this.setState({ isEdit: false });
        const BookList = this.state.bookData.map((fly) => (


            <tr key={fly._id}>
                <td>{fly.bookId}</td>
                <td> {fly.firstname}  {fly.lastname}</td>
                <td> {fly.flightID}</td>
                <td> {fly.number} </td>
                <td> {fly.Nationality} </td>
                <td> {fly.email}</td>
                <td> {fly.amount}</td>
                <td> {fly.status}</td>
                <td>
                    <ButtonToolbar>
                        <Button
                            variant="outline-primary"
                            onClick={() => { this.setState({ isEdit: true }); this.setState({ bookId: fly.bookId }); }}
                        ><img src="data:image/jpeg;base64,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" className="rounded" style={{ height: "3vh", width: "3vh" }} /></Button>

                        <Edit
                            show={this.state.isEdit}
                            onHide={isEditModalClose}
                            tokeen={this.props.match.params.token}
                            bookid={this.state.bookId}
                        />
                    </ButtonToolbar>
                </td>
                <td className="btn" style={{ textAlign: "center", alignContent: "center" }} onClick={() => {
                    fetch("http://localhost:7002/bookings/book/" + fly.bookId, { method: "DELETE" }).then((e) => e.json()).then((rems) => {
                        console.log(rems); alert(`message : ${rems.message}`)
                        window.location.reload();
                    })
                        .catch((err) => { console.log(err); alert(`error occured ${err}`) })
                }}> <img src="https://elasq.com/wp-content/uploads/2021/04/delete-icon29.png" className="rounded" style={{ height: "5vh", width: "5vh" }} /> </td>

                <td>{fly.amount !== 0 ? (<button className="btn btn-outline-primary" onClick={() => {
                    this.displayRazorpay(fly);
                }} > Pay</button>) : <div />}</td>

                <td>{fly.amount === 0 ? (<button className="btn btn-outline-success" onClick={() => {
                    this.downloadPDF(fly);
                }}><img src="https://iconarchive.com/download/i99352/dtafalonso/android-lollipop/Downloads.ico"
                 className="rounded" style={{ height: "3vh", width: "3vh" }} /></button>) : <div />}</td>


            </tr>



        ));


        const flightList = this.state.data.map((flight) => (
            <tr key={flight._id}>
                <td>{flight.flightId}</td>
                <td>{flight.flightSource}</td>
                <td>{flight.flightDestination}</td>
                <td>{flight.flightArrival}</td>
                <td>{flight.flightDeparture}</td>
                <td>{flight.amount}</td>
                <td>
          <button
            className="btn btn-outline-secondary"
            onClick={() => this.routeChange(flight)}
          >
            Book
          </button>
        </td>
            </tr>
        ));
        let isFormModalClose = () => this.setState({ isForm: false });
        return (
            <div >

                <hr />
                <div className="d-flex justify-content-between" >

                    {/* <button className="btn btn-outline-primary" style={{ margin: "10px 10px" }} onClick={() => {
                         this.setState({ isShow: !this.state.isShow }) 
                         }} >Book New Journey</button> */}
                    <ButtonToolbar>
                        <Button
                            variant="outline-primary"
                            onClick={() => { this.setState({ isForm: true }); }}
                        >New Journey</Button>

                        <NewFlight
                            show={this.state.isForm}
                            onHide={isFormModalClose}
                            tokeen={this.props.match.params.token}
                            bookdata={this.state.bookData}
                        />
                    </ButtonToolbar>
                    <h4 style={{ margin: "10px 10px" }}>Welcome {this.state.bookData[0].firstname}</h4>
                    <button className="btn btn-outline-danger" style={{ margin: "10px 10px" }} onClick={() => { this.setState({ token: "" }); this.props.history.push(path); }} >Logout</button>
                </div>
                <hr />
                <h4 style={{ textJustify: 'auto' }}>Your Bookings</h4>
                <table className="table table-hover container-sm">
                    <thead>
                        <tr>
                            <td>Booking ID</td>
                            <td> Name</td>
                            <td> Flight ID</td>
                            <td> Number </td>
                            <td> Nationality </td>
                            <td> Email</td>
                            <td> Due Amount</td>
                            <td> Status</td>
                            <td>Edit</td>
                            <td>Delete</td>
                            <td>Pay</td>
                            <td>Download</td>
                        </tr>
                    </thead>
                    <tbody>{BookList}</tbody>
                </table>



                {/* ----------------------make search component <div>
                        <div style={{ textAlign: "center" }}>{this.state.isShow ? this.showSearch() : this.getsomething()}</div>
                    </div> */}


                <hr />
                <h5 style={{ textAlign: "center" }}>Available Flights</h5>
                <hr />
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <td> <button className="btn btn-outline-secondary" style={{ width: "10rem", margin: "10px 10px" }} onClick={() => {
                                this.setState({ data: this.state.data.sort((a, b) => (a.flightId > b.flightId ? 1 : -1)) })
                            }}>flightId</button></td>
                            <td><button className="btn btn-outline-secondary" style={{ margin: "10px 10px" }} onClick={() => {
                                const a = this.state.data.sort((a, b) => (a.flightSource > b.flightSource ? 1 : -1));
                                this.setState({ data: a });
                            }}>Flight Source</button></td>
                            <td><button className="btn btn-outline-secondary" style={{ margin: "10px 10px" }} onClick={() => {
                                const a = this.state.data.sort((a, b) => (a.flightDestination > b.flightDestination ? 1 : -1));
                                this.setState({ data: a });
                            }}>Flight Destination</button></td>
                            <td><button className="btn btn-outline-secondary" style={{ margin: "10px 10px" }} onClick={() => {
                                const a = this.state.data.sort((a, b) => (a.flightArrival > b.flightArrival ? 1 : -1));
                                this.setState({ data: a });
                            }}>Flight Arrival</button></td>
                            <td><button className="btn btn-outline-secondary" style={{ margin: "10px 10px" }} onClick={() => {
                                const a = this.state.data.sort((a, b) => (a.flightDeparture > b.flightDeparture ? 1 : -1));
                                this.setState({ data: a });
                            }}>Flight Departure</button></td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>{flightList}</tbody>
                </table>

            </div>
        )
    }
}

export default withRouter(CheckStatus)
