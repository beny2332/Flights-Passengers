// Constants and DOM element selections
const BASE_URL: string = "https://66ead5c155ad32cda47a9e06.mockapi.io/api/"
const orderFieldsSection: HTMLElement = document.querySelector('.orderFields')!
const pasangersSection: HTMLElement = document.querySelector('.pasangers')!
const selectElm: HTMLSelectElement = document.querySelector('select')!
const nameInpElm: HTMLInputElement = document.querySelector('.pass-name')!
const maleRadio: HTMLInputElement = document.querySelector("#m")!
const femaleRadio: HTMLInputElement = document.querySelector("#f")!
const sendBtn: HTMLButtonElement = document.querySelector('#sendBtn')!
const editBtn: HTMLButtonElement = document.querySelector('.editBtn')!

const AGENT_CODE:string = "1234543"

// let flightsList: flight[] = []
// let pasangersList: fetchedPassenger[] = []


const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})

const getFlights = async (): Promise <void> => {
    try {
        const res: Response = await fetch(BASE_URL + 'flights')
        const flights : flight[] = await res.json()
        
        for (const flight of flights) {
            const opt: HTMLOptionElement = document.createElement('option')
            opt.value = flight.id.toString()
            const formattedDate = dateFormatter.format(new Date(flight.date))
            opt.textContent = `${flight.from}    ✈︎   ${flight.to} |  Date: ${formattedDate} `
            selectElm.appendChild(opt)
        }
        
    } catch (error) {
        console.log(error)
    }
}

const getPasengers = async ():Promise <void> => {
    try {
        const [pasangersRes, flightsRes] = await Promise.all([
            fetch(BASE_URL + 'pasangers'),
            fetch(BASE_URL + 'flights')
        ])
        
        const pasangers: fetchedPassenger[] = await pasangersRes.json()
        const flights: flight[] = await flightsRes.json()

        const flightMap = new Map(flights.map(flight => [flight.id, flight]))

        pasangersSection.innerHTML = ''
        for (const pasanger of pasangers) {
            if (pasanger.agent === AGENT_CODE){
            const psngDiv: HTMLDivElement = document.createElement('div')
            psngDiv.className = 'psng-div'
            const psngDetails: HTMLParagraphElement = document.createElement('p')

            const flight = flightMap.get(pasanger.flight_id)
            if (flight) {
                const formattedDate = dateFormatter.format(new Date(flight.date))
                psngDetails.textContent = `${pasanger.name} - ${flight.from}  ✈︎  ${flight.to} |  Date: ${formattedDate}`
                
            } else {
                psngDetails.textContent = `${pasanger.name} - Flight details not available`;
            }

            const editBtn: HTMLButtonElement = document.createElement('button')
            editBtn.textContent = 'Edit'
            editBtn.className = 'edit-btn'
            
            const deleteBtn: HTMLButtonElement = document.createElement('button')
            deleteBtn.textContent = 'Delete'
            deleteBtn.className = 'delete-btn'
            deleteBtn.addEventListener('click', () => deletePassenger(pasanger))
            
            psngDiv.appendChild(psngDetails)
            psngDiv.appendChild(deleteBtn)
            psngDiv.appendChild(editBtn)
            pasangersSection.appendChild(psngDiv)
        }
    }
        
    } catch (error) {
        console.log(error)
    }

}

const createNewPassenger = async (name:string, gender: string, flight_id: string): Promise<void> => {
    const newPassenger: pasanger = {
        createdAt: new Date().toISOString(),
        name,
        gender,
        flight_id,
        agent: AGENT_CODE
    }
    try {
        const res = await fetch(`${BASE_URL}${Resources.PASANGERS}`, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPassenger)
        })
        if (!res.ok){
            throw new Error("Failed to create new passenger");
            
        }
        const createdPassenger: pasanger = await res.json()
        console.log('New passenger created:', createdPassenger);
        await getPasengers()
    } catch (error) {
        console.error('Error creating new passenger:', error);
    }
}

getPasengers()
getFlights()

const deletePassenger = async (pasanger: fetchedPassenger): Promise<void> => {
    try {
        const res = await fetch(`${BASE_URL}${Resources.PASANGERS}/${pasanger.id}`,{
            method: 'DELETE'
        })

        if (!res.ok) {
            throw new Error("Failed to delete passenger");
        }

        console.log(`Passenger: ${pasanger.name} was deleted successfully`);
        
        await getPasengers()
    } catch (error) {
        console.error('Error deleting passenger:', error)
    }
}




//Event Listeners

sendBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    try {
        const name = nameInpElm.value
        const gender = maleRadio.checked ? 'Male' : 'Female'
        const flight_id = selectElm.value

        await createNewPassenger(name, gender, flight_id)
        console.log('Passenger created successfuly')

        nameInpElm.value = ''
        selectElm.selectedIndex = 0
        
    } catch (error) {
        console.error('Error creating passenger:', error)
    }
       
})

// Interfaces
interface flight {
    date: string
    from:string
    to: string
    id: string
}

interface pasanger {
    createdAt: string
    name: string
    gender: string
    flight_id: string
    agent: string
    id?: string
}

interface fetchedPassenger extends pasanger{
    id: string
}

enum Resources {
        FLIGHTS = 'flights',
        PASANGERS = 'pasangers'
}


