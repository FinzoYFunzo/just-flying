import './Image.css'

export function Image({visible, src, color, id}: { visible: number, src: string | undefined, color: string, id: number}) {
    return (
        <div
            className='image-container'
            style={{
                backgroundColor: color,
                opacity: visible
            }}
        >
            <img
                className={"image-src"}
                id={`image-${id}`}
                src={src}
            />
        </div>
    )
}