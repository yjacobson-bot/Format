import 'package:flutter/material.dart';
import '../utils/formats.dart';

class FormatGrid extends StatefulWidget {
  final List<FormatOption> formats;
  final void Function(FormatOption) onFormatSelected;

  const FormatGrid({super.key, required this.formats, required this.onFormatSelected});

  @override
  State<FormatGrid> createState() => _FormatGridState();
}

class _FormatGridState extends State<FormatGrid> {
  String? _selectedId;

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.85,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: widget.formats.length,
      itemBuilder: (context, index) {
        final fmt = widget.formats[index];
        final isSelected = _selectedId == fmt.id;
        return GestureDetector(
          onTap: () {
            setState(() => _selectedId = fmt.id);
            widget.onFormatSelected(fmt);
          },
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            decoration: BoxDecoration(
              color: isSelected ? Theme.of(context).colorScheme.primaryContainer : Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey.shade200,
                width: isSelected ? 2 : 1,
              ),
              boxShadow: isSelected ? [
                BoxShadow(color: Theme.of(context).colorScheme.primary.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 2))
              ] : null,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(fmt.icon, style: const TextStyle(fontSize: 24)),
                const SizedBox(height: 4),
                Text(
                  fmt.label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Theme.of(context).colorScheme.primary : Colors.grey.shade800,
                  ),
                ),
                const SizedBox(height: 2),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Text(
                    fmt.description,
                    style: TextStyle(fontSize: 9, color: Colors.grey.shade500),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
