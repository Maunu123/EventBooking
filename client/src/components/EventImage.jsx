const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';

export default function EventImage({ src, alt = '', ...props }) {
    function useFallback(event) {
        event.currentTarget.onerror = null;
        event.currentTarget.src = FALLBACK_IMAGE;
    }

    return <img src={src || FALLBACK_IMAGE} alt={alt} onError={useFallback} {...props} />;
}
