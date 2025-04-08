import './Services.css'
interface ServiceProps {
    icon:string;
    text:string;
    
}

function Services({icon, text}: ServiceProps) {
    return(
        <div className="services">
            <img src={icon} alt={text} className="icon" />
            <div className="description-box">
                <p className="text">{text}</p>            
            </div>
        </div>
    );
}

export default Services;